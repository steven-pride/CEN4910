import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ---------------------------------------------------------------------------
// Config: one entry per table. The page, forms, and actions are all driven
// from this, so adding a table = adding an entry.
// NOTE: create/edit/remove only control which buttons are SHOWN.
// Row Level Security in the database is what actually enforces access.
// ---------------------------------------------------------------------------
type Role = 'admin' | 'property_manager' | 'analyzer'
type Opt = { value: string; label: string }
type Col = {
  name: string // database column
  label: string // human-readable header
  type?: 'text' | 'number' | 'date' | 'select'
  options?: Opt[]
  readOnly?: boolean
}
type Cfg = {
  label: string
  pk: Col[]
  cols: Col[]
  pkInCreate?: boolean // true when the user supplies the key (e.g. assignments)
  create: Role[]
  edit: Role[]
  remove: Role[]
}

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  property_manager: 'Property Manager',
  analyzer: 'Analyzer',
}
const ROLE_OPTIONS: Opt[] = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const ADMIN: Role[] = ['admin']
const WRITERS: Role[] = ['admin', 'property_manager']

const TABLES: Record<string, Cfg> = {
  property: {
    label: 'Properties',
    pk: [{ name: 'property_id', label: 'Property ID', type: 'number' }],
    cols: [
      { name: 'property_name', label: 'Name' },
      { name: 'address_line1', label: 'Address Line 1' },
      { name: 'address_line2', label: 'Address Line 2' },
      { name: 'city', label: 'City' },
      { name: 'state_province', label: 'State / Province' },
      { name: 'postal_code', label: 'Postal Code' },
      { name: 'irrigated_area', label: 'Irrigated Area', type: 'number' },
      { name: 'year_built', label: 'Year Built', type: 'number' },
      { name: 'occupancy_percent', label: 'Occupancy (%)', type: 'number' },
      { name: 'number_of_buildings', label: 'Buildings', type: 'number' },
    ],
    create: ADMIN,
    edit: WRITERS,
    remove: ADMIN,
  },
  meter: {
    label: 'Meters',
    pk: [{ name: 'meter_id', label: 'Meter ID', type: 'number' }],
    cols: [
      { name: 'property_id', label: 'Property ID', type: 'number' },
      { name: 'meter_name', label: 'Meter Name' },
      { name: 'meter_type', label: 'Meter Type' },
      { name: 'default_unit', label: 'Default Unit ID', type: 'number' },
      { name: 'active_date', label: 'Active Date', type: 'date' },
      { name: 'inactive_date', label: 'Inactive Date', type: 'date' },
    ],
    create: WRITERS,
    edit: WRITERS,
    remove: WRITERS,
  },
  meter_reading: {
    label: 'Meter Readings',
    pk: [{ name: 'meter_reading_id', label: 'Reading ID', type: 'number' }],
    cols: [
      { name: 'meter_id', label: 'Meter ID', type: 'number' },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'usage_quantity', label: 'Usage', type: 'number' },
      { name: 'unit', label: 'Unit ID', type: 'number' }, // blank on create = autofill from meter
      { name: 'cost', label: 'Cost (USD)', type: 'number' },
    ],
    create: WRITERS,
    edit: WRITERS,
    remove: WRITERS,
  },
  property_assignment: {
    label: 'Assignments',
    pk: [
      { name: 'user_id', label: 'User ID' },
      { name: 'property_id', label: 'Property ID', type: 'number' },
    ],
    cols: [],
    pkInCreate: true,
    create: ADMIN,
    edit: [],
    remove: ADMIN,
  },
  user_profile: {
    label: 'Users',
    pk: [{ name: 'user_id', label: 'User ID' }],
    cols: [
      { name: 'email', label: 'Email', readOnly: true },
      { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS },
    ],
    create: [], // profiles are created by the signup trigger
    edit: ADMIN,
    remove: ADMIN,
  },
}

// ---------------------------------------------------------------------------
// Server Actions. Each returns to the page; errors show via ?error=...
// ---------------------------------------------------------------------------
function tableFrom(formData: FormData) {
  const key = String(formData.get('table'))
  const cfg = TABLES[key]
  if (!cfg) throw new Error('Unknown table')
  return { key, cfg }
}

function parse(formData: FormData, cols: Col[]) {
  const out: Record<string, unknown> = {}
  for (const c of cols) {
    if (c.readOnly) continue
    const v = formData.get(c.name)
    out[c.name] = v === null || v === '' ? null : c.type === 'number' ? Number(v) : String(v)
  }
  return out
}

function pkOf(formData: FormData, cfg: Cfg) {
  return Object.fromEntries(cfg.pk.map((c) => [c.name, String(formData.get(`pk_${c.name}`))]))
}

function done(key: string, message?: string): never {
  redirect(`/sample-crud?table=${key}${message ? `&error=${encodeURIComponent(message)}` : ''}`)
}

async function createRow(formData: FormData) {
  'use server'
  const { key, cfg } = tableFrom(formData)
  const supabase = await createClient()
  const cols = cfg.pkInCreate ? [...cfg.pk, ...cfg.cols] : cfg.cols
  const { error } = await supabase.from(key).insert(parse(formData, cols))
  done(key, error?.message)
}

async function updateRow(formData: FormData) {
  'use server'
  const { key, cfg } = tableFrom(formData)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(key)
    .update(parse(formData, cfg.cols))
    .match(pkOf(formData, cfg))
    .select()
  // RLS-blocked updates match 0 rows without raising an error, so check
  done(key, error?.message ?? (data?.length ? undefined : 'Not allowed or not found'))
}

async function deleteRow(formData: FormData) {
  'use server'
  const { key, cfg } = tableFrom(formData)
  const supabase = await createClient()
  const { data, error } = await supabase.from(key).delete().match(pkOf(formData, cfg)).select()
  done(key, error?.message ?? (data?.length ? undefined : 'Not allowed or not found'))
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------
const inputCls = 'h-8 w-full min-w-28 rounded-md border bg-transparent px-2 text-sm'

const isPk = (cfg: Cfg, c: Col) => cfg.pk.some((p) => p.name === c.name)
const shownCols = (cfg: Cfg): Col[] => [
  ...cfg.pk.map((c) => ({ ...c, readOnly: true })),
  ...cfg.cols,
]

// Inputs live in table cells but belong to a <form> elsewhere (via the `form`
// attribute), because <form> can't wrap table rows in valid HTML.
function Field({
  col,
  value,
  form,
  locked,
}: {
  col: Col
  value?: unknown
  form?: string
  locked?: boolean
}) {
  if (locked || col.readOnly) {
    const shown = col.options?.find((o) => o.value === value)?.label ?? value
    return <span>{shown == null || shown === '' ? '—' : String(shown)}</span>
  }
  if (col.type === 'select') {
    return (
      <select
        aria-label={col.label}
        name={col.name}
        form={form}
        defaultValue={String(value ?? col.options![0].value)}
        className={inputCls}
      >
        {col.options!.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }
  return (
    <input
      aria-label={col.label}
      name={col.name}
      form={form}
      defaultValue={(value ?? '') as string}
      type={col.type ?? 'text'}
      step={col.type === 'number' ? 'any' : undefined}
      className={inputCls}
    />
  )
}

export default async function ManagePage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; error?: string }>
}) {
  const { table, error } = await searchParams
  const key = table && TABLES[table] ? table : 'property'
  const cfg = TABLES[key]

  const supabase = await createClient()

  // Who is this, and what's their role?
  const { data: auth } = await supabase.auth.getClaims()
  const userId = auth?.claims?.sub
  if (!userId) redirect('/login')

  const { data: me } = await supabase
    .from('user_profile')
    .select('role')
    .eq('user_id', userId)
    .single()
  if (!me) return <p className="p-6">No profile found for your account. Ask an admin.</p>

  const role = me.role as Role
  const canCreate = cfg.create.includes(role)
  const canEdit = cfg.edit.includes(role)
  const canRemove = cfg.remove.includes(role)
  const canSave = canEdit && cfg.cols.some((c) => !c.readOnly)
  const rowActions = canSave || canRemove
  const showActions = canCreate || rowActions

  // RLS returns only the rows this user is allowed to see
  const { data: rows, error: readError } = await supabase
    .from(key)
    .select('*')
    .order(cfg.pk[0].name)
    .limit(100)

  const cols = shownCols(cfg)

  return (
    <main className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Manage Data</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <b>{ROLE_LABELS[role]}</b>
        </p>
      </div>

      <nav className="flex flex-wrap gap-4 text-sm">
        {Object.entries(TABLES).map(([k, c]) => (
          <Link
            key={k}
            href={`/sample-crud?table=${k}`}
            className={k === key ? 'font-semibold underline' : 'text-muted-foreground'}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      {(error || readError) && (
        <p className="text-sm text-destructive">{error ?? readError?.message}</p>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {cols.map((c) => (
              <TableHead key={c.name}>{c.label}</TableHead>
            ))}
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* CREATE: first row of the table */}
          {canCreate && (
            <TableRow className="bg-muted/50">
              {cols.map((c) => (
                <TableCell key={c.name}>
                  {isPk(cfg, c) && !cfg.pkInCreate ? null : (
                    <Field col={{ ...c, readOnly: false }} form="create-form" />
                  )}
                </TableCell>
              ))}
              <TableCell>
                <form id="create-form" action={createRow}>
                  <input type="hidden" name="table" value={key} />
                </form>
                <Button type="submit" form="create-form" size="sm">
                  Add
                </Button>
              </TableCell>
            </TableRow>
          )}

          {/* READ / UPDATE / DELETE */}
          {(rows ?? []).map((r) => {
            const id = cfg.pk.map((c) => r[c.name]).join('-')
            const fid = `row-${id}`
            return (
              <TableRow key={id}>
                {cols.map((c) => (
                  <TableCell key={c.name}>
                    <Field col={c} value={r[c.name]} form={fid} locked={!canEdit} />
                  </TableCell>
                ))}
                {showActions && (
                  <TableCell>
                    {rowActions && (
                      <div className="flex gap-2">
                        <form id={fid} action={updateRow}>
                          <input type="hidden" name="table" value={key} />
                          {cfg.pk.map((c) => (
                            <input
                              key={c.name}
                              type="hidden"
                              name={`pk_${c.name}`}
                              value={String(r[c.name])}
                            />
                          ))}
                        </form>
                        {canSave && (
                          <Button type="submit" form={fid} variant="outline" size="sm">
                            Save
                          </Button>
                        )}
                        {canRemove && (
                          <Button
                            type="submit"
                            form={fid}
                            formAction={deleteRow}
                            variant="destructive"
                            size="sm"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            )
          })}

          {rows?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={cols.length + (showActions ? 1 : 0)}
                className="text-center text-muted-foreground"
              >
                No rows to show.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </main>
  )
}

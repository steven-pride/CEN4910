'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export default function CalcsPage() {

  const [eui, setEui] = useState<number>(0);
  const [pue, setPue] = useState<number>(0);
  const [gas, setGas] = useState<number>(0);
  const [eli, setEli] = useState("");
  const [userInput1, setUserInput1] = useState("");
  const [userInput2, setUserInput2] = useState("");
  const [userInput3, setUserInput3] = useState("");
  const [userInput4, setUserInput4] = useState("");
  const [userInput5, setUserInput5] = useState("");
  const [userInput6, setUserInput6] = useState("");
  
  const handleClickEUI = async () => {
    
    const kBtu = Number(userInput1);
    const sqft = Number(userInput2);

    if (Number.isNaN(kBtu) || (Number.isNaN(sqft))) {
      setEui(-1);
    }
    else {
      const response = await fetch(`/api/math/eui/var1/${kBtu}/var2/${sqft}`);
      const data = await response.json();
      const value = Number(data.value);
      setEui(value);
    }
    
  };

  const handleClickPUE = async () => {
    
    const kWh1 = Number(userInput3);
    const kWh2 = Number(userInput4);

    if (Number.isNaN(kWh1) || (Number.isNaN(kWh2))) {
      setPue(-1);
    }
    else {
      const response = await fetch(`/api/math/eui/var1/${kWh1}/var2/${kWh2}`);
      const data = await response.json();
      const value = Number(data.value);
      setPue(value);
    }
    
  };

  const handleClickGas = async () => {
    
    const gas = Number(userInput5);

    if (Number.isNaN(gas)) {
      setGas(-1);
    }
    else {
      const response = await fetch(`/api/math/gas/${gas}`);
      const data = await response.json();
      const value = Number(data.value);
      setGas(value);
    }
    
  };

  const handleClickEli = async () => {
    
    const id = Number(userInput6);

    if (Number.isNaN(gas)) {
      setEli("Error");
    }
    else {
      const response = await fetch(`/api/math/eligible/${id}`);
      const data = await response.json();
      const value = data.value;

      if (value) {
        setEli("Yes");
      }
      else {
        setEli("No");
      }
    }
    
  };

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/50 px-4 py-12 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
            Calculated EUI: {eui.toFixed(2)} (kBtu/ft<sup>2</sup>)
          </h1>
        </div>
        <form className="space-y-5" onSubmit={(e) => {e.preventDefault();}}>
          <div className="space-y-2">
            <label htmlFor="calckBtu" className="text-sm font-medium">
              Enter kBtu:
            </label>
            <Input
              id="calckBtu"
              name="calckBtu"
              type="text"
              autoComplete="off"
              value={userInput1}
              onChange={(e) => setUserInput1(e.target.value)}
              required
              className="h-11 rounded-lg bg-background"
            />
            <label htmlFor="calcsqft" className="text-sm font-medium">
              Enter Square Feet:
            </label>
            <Input
              id="calcsqft"
              name="calcsqft"
              type="text"
              autoComplete="off"
              value={userInput2}
              onChange={(e) => setUserInput2(e.target.value)}
              required
              className="h-11 rounded-lg bg-background"
            />
          </div>
          <Button type="button" variant="default" size="lg" className="w-full" onClick={handleClickEUI}>
            Calculate
          </Button>
        </form>
      </section>


      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
            Calculated PUE: {pue.toFixed(2)}
          </h1>
        </div>
        <form className="space-y-5" onSubmit={(e) => {e.preventDefault();}}>
          <div className="space-y-2">
            <label htmlFor="kWh1" className="text-sm font-medium">
              Enter Annual Energy Consupmtion in kWh:
            </label>
            <Input
              id="kWh1"
              name="kWh1"
              type="text"
              autoComplete="off"
              value={userInput3}
              onChange={(e) => setUserInput3(e.target.value)}
              required
              className="h-11 rounded-lg bg-background"
            />
            <label htmlFor="calcsqft" className="text-sm font-medium">
              Enter UPS Power Consumption in kWh:
            </label>
            <Input
              id="calcsqft"
              name="calcsqft"
              type="text"
              autoComplete="off"
              value={userInput4}
              onChange={(e) => setUserInput4(e.target.value)}
              required
              className="h-11 rounded-lg bg-background"
            />
          </div>

          <Button type="button" variant="default" size="lg" className="w-full" onClick={handleClickPUE}>
            Calculate
          </Button>
        </form>
      </section>


      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
            Greenhouse Gas Emissions: {gas.toFixed(2)} (CO2E lb.)
          </h1>
        </div>
        <form className="space-y-5" onSubmit={(e) => {e.preventDefault();}}>
          <div className="space-y-2">
            <label htmlFor="gas" className="text-sm font-medium">
              Enter Consumed kWh:
            </label>
            <Input
              id="gas"
              name="gas"
              type="text"
              autoComplete="off"
              value={userInput5}
              onChange={(e) => setUserInput5(e.target.value)}
              required
              className="h-11 rounded-lg bg-background"
            />
          </div>

          <Button type="button" variant="default" size="lg" className="w-full" onClick={handleClickGas}>
            Calculate
          </Button>
        </form>
      </section>


      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
            Energy Star Eligible: {eli}
          </h1>
        </div>
        <form className="space-y-5" onSubmit={(e) => {e.preventDefault();}}>
          <div className="space-y-2">
            <label htmlFor="eli" className="text-sm font-medium">
              Enter Property ID:
            </label>
            <Input
              id="eli"
              name="eli"
              type="text"
              autoComplete="off"
              value={userInput6}
              onChange={(e) => setUserInput6(e.target.value)}
              required
              className="h-11 rounded-lg bg-background"
            />
          </div>

          <Button type="button" variant="default" size="lg" className="w-full" onClick={handleClickEli}>
            Calculate
          </Button>
        </form>
      </section>
    </main>
  );
}
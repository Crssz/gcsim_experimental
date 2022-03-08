// sim page

import React, { FormEventHandler, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../store";
import {
  fetchOptimization,
  SimulationStatus,
} from "../store/slices/simulationSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Sim() {
  const [fluid, setFluid] = useState(20);
  const dispatch = useDispatch();
  const state = useSelector((state: AppState) => state.simulation);
  const extract_dps = useMemo(() => {
    return state.results.map((res) => {
      return res.damage_by_char.map((char, index) => {
        const name = res.char_names[index];
        const dmg = Object.keys(char).reduce((acc, key) => {
          return acc + char[key].mean;
        }, 0);
        return { name, dmg };
      });
    });
  }, [state]);

  const progress = useMemo(() => {
    switch (state.status) {
      case SimulationStatus.Optimizing:
        return 25;
      case SimulationStatus.Optimized:
        return 50;
      case SimulationStatus.Simulating:
        return 75;
      default:
        return 0;
    }
  }, [state.status]);
  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    if (state.status !== SimulationStatus.Finished) return;
    const form = new FormData(e.currentTarget as HTMLFormElement);
    dispatch(
      fetchOptimization({
        script: form.get("script").toString(),
        fluidSubstats: parseInt(form.get("fluidSubstats").toString()),
      })
    );
  };
  const fluidChange = (e) => {
    setFluid(parseInt(e.currentTarget.value));
  };

  return (
    <>
      <div className="navbar rounded-box shadow-xl bg-base-100">
        <a href="#" className="btn text-xl btn-ghost">
          test
        </a>
      </div>
      <div className="container mt-4 text-center mx-auto">
        <form onSubmit={submit} className="block">
          <div>
            <textarea
              name="script"
              className="textarea textarea-primary w-4/5 lg:w-[800px] min-h-[400px]"
            ></textarea>
          </div>
          <input
            onChange={fluidChange}
            name="fluidSubstats"
            type="range"
            min="0"
            max="20"
            value={fluid}
            className="range range-primary w-[300px]"
          ></input>
          <p className="mb-4">{fluid}</p>
          <button
            disabled={[
              SimulationStatus.Optimizing,
              SimulationStatus.Optimized,
              SimulationStatus.Simulating,
            ].includes(state.status)}
            className="btn"
            type="submit"
          >
            sim
          </button>
        </form>
        {progress > 0 && (
          <progress
            className="progress progress-primary w-56"
            value={progress}
            max="100"
          />
        )}
        {/* <div className="text-red-400 text-left">
          {state.results.map((result, i) => {
            return <pre key={i}>{result.text}</pre>;
          })}
        </div> */}
        <p>team DPS</p>
        <div className="text-center">
          <div className="w-[600px] h-[300px] mx-auto">
            <ResponsiveContainer>
              <LineChart
                width={500}
                height={300}
                data={state.results.map((v, i) => ({
                  name: i,
                  value: v.dps.mean,
                }))}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="linear" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {state.results.length > 0 &&
            state.results[0].char_names.map((name, i) => {
              return (
                <div className="w-[600px] h-[300px] my-4 mx-auto" key={name}>
                  <p>{name}</p>
                  <ResponsiveContainer>
                    <LineChart
                      width={500}
                      height={300}
                      data={state.results.map((v, j) => ({
                        name: j,
                        dps: Object.keys(v.damage_by_char[i]).reduce(
                          (acc, key) => acc + v.damage_by_char[i][key].mean,
                          0
                        ),
                      }))}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="linear" dataKey="dps" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}

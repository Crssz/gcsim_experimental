import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import JSzip from 'jszip'
import { GCsimResult } from "../../type";
export enum SimulationStatus {
    Optimizing = "Optimizing",
    Optimized = "Optimized",
    Simulating = "Simulating",
    Finished = "Finished",
    Error = "Error",
}

export type optimizationResult = { optimizedScripts: string[], error: any }
export const fetchOptimization = createAsyncThunk<optimizationResult, { script: string, fluidSubstats: number }>(
    'simulation/fetchOptimization',
    async (payload, thunkAPI) => {
        if (payload.fluidSubstats > 20 || payload.fluidSubstats < 0) {
            throw new Error("Invalid number of fluid substats")
        }
        const response = await fetch('/api/optimization', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const optimization: optimizationResult = await response.json();
        thunkAPI.dispatch(fetchSimulation({
            scripts: optimization.optimizedScripts,
        }))
        return optimization;
    }
)

export const fetchSimulation = createAsyncThunk<{ results: GCsimResult[] }, { scripts: string[] }>(
    'simulation/fetchSimulation',
    async (payload, thunkAPI) => {
        const response = await fetch('/api/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const results = await response.arrayBuffer()
        let zip = new JSzip()
        const data = await zip.loadAsync(results)
        const results_text = await Promise.all(
            Object.keys(data.files).map((_, i) => data.file(`${i}.json`).async("string"))
        )
        return {
            results: results_text.map(v => JSON.parse(v))
        }
    }
)

const simulationSlice = createSlice({
    name: 'simulation',
    initialState: {
        status: SimulationStatus.Finished,
        optimizedScripts: [],
        error: null,
        fluidSubstats: 20,
        results: [] as Array<Omit<GCsimResult, "debug">>,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchOptimization.pending, (state, action) => {
            state.status = SimulationStatus.Optimizing;
            state.fluidSubstats = action.meta.arg.fluidSubstats;
            state.optimizedScripts = [];
            state.error = null;
        });
        builder.addCase(fetchOptimization.fulfilled, (state, action) => {
            state.status = SimulationStatus.Optimized;
            state.optimizedScripts = action.payload.optimizedScripts;
        });
        builder.addCase(fetchOptimization.rejected, (state, action) => {
            state.status = SimulationStatus.Error;
            state.error = action.error.message;
        });
        builder.addCase(fetchSimulation.pending, (state, action) => {
            state.status = SimulationStatus.Simulating;
        });
        builder.addCase(fetchSimulation.fulfilled, (state, action) => {
            state.status = SimulationStatus.Finished;
            state.results = action.payload.results;
        });
        builder.addCase(fetchSimulation.rejected, (state, action) => {
            state.status = SimulationStatus.Error;
            state.error = action.error.message;
        });
    }
})

export default simulationSlice.reducer

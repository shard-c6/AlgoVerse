package com.algoverse;

import io.javalin.Javalin;
import io.javalin.http.Context;
import java.util.Map;

public class App {
    public static void main(String[] args) {
        Javalin app = Javalin.create(config -> {
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> {
                    it.anyHost();
                });
            });
        }).start(8084);

        app.post("/visualize", App::handleVisualize);
        app.post("/benchmark", App::handleBenchmark);
    }

    private static void handleVisualize(Context ctx) throws Exception {
        handleRequest(ctx, true);
    }

    private static void handleBenchmark(Context ctx) throws Exception {
        handleRequest(ctx, false);
    }

    private static void handleRequest(Context ctx, boolean visualization) throws Exception {
        Map<String, Object> body = ctx.bodyAsClass(Map.class);
        String algorithm = (String) body.get("algorithm");
        
        java.util.List<?> rawArray = (java.util.List<?>) body.get("array");
        int[] arr = new int[rawArray.size()];
        for (int i = 0; i < rawArray.size(); i++) {
            arr[i] = ((Number) rawArray.get(i)).intValue();
        }
        
        Algorithms.AlgorithmResult result;

        switch (algorithm) {
            case "bubble_sort":
                result = Algorithms.runBubbleSort(arr, visualization);
                break;
            case "quick_sort":
                result = Algorithms.runQuickSort(arr, visualization);
                break;
            case "merge_sort":
                result = Algorithms.runMergeSort(arr, visualization);
                break;
            case "insertion_sort":
                result = Algorithms.runInsertionSort(arr, visualization);
                break;
            case "selection_sort":
                result = Algorithms.runSelectionSort(arr, visualization);
                break;
            case "heap_sort":
                result = Algorithms.runHeapSort(arr, visualization);
                break;
            case "radix_sort":
                result = Algorithms.runRadixSort(arr, visualization);
                break;
            default:
                ctx.status(400).result("{\"error\":\"Unknown algorithm: " + algorithm + "\"}");
                return;
        }

        ctx.json(result);
    }
}

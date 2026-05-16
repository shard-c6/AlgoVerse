package com.algoverse;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Algorithms {

    public static class Metadata {
        public Integer line_number;
        public Metadata(Integer line_number) {
            this.line_number = line_number;
        }
    }

    public static class Event {
        public List<Integer> values;
        public List<Integer> indices;
        public String category;
        public String event;
        public String description;
        public Metadata metadata;
        public long timestamp;

        public Event(int[] array, List<Integer> highlighted, String category, String event, String description, Integer lineNumber) {
            if (array != null) {
                this.values = new ArrayList<>();
                for (int val : array) {
                    this.values.add(val);
                }
            } else {
                this.values = null;
            }
            this.indices = highlighted != null ? highlighted : new ArrayList<>();
            this.category = category;
            this.event = event;
            this.description = description;
            if (lineNumber != null) {
                this.metadata = new Metadata(lineNumber);
            }
            this.timestamp = System.currentTimeMillis();
        }
    }

    public static class Metrics {
        public double time_ms;
        public Object comparisons = null;
        public Object swaps = null;

        public Metrics(double time_ms) {
            this.time_ms = time_ms;
        }
    }

    public static class Complexity {
        public String time;
        public String space;

        public Complexity(String time, String space) {
            this.time = time;
            this.space = space;
        }
    }

    public static class AlgorithmResult {
        public String version = "1.0";
        public String language = "java";
        public String algorithm;
        public String mode;
        public List<Event> events;
        public Metrics metrics;
        public Complexity complexity;

        public AlgorithmResult(String algorithm, String mode, List<Event> events, double time_ms) {
            this.algorithm = algorithm;
            this.mode = mode;
            this.events = events;
            this.metrics = new Metrics(time_ms);
            
            if (algorithm.equals("bubble_sort") || algorithm.equals("insertion_sort") || algorithm.equals("selection_sort") || algorithm.equals("shell_sort")) {
                this.complexity = new Complexity("O(n^2)", "O(1)");
            } else if (algorithm.equals("quick_sort") || algorithm.equals("merge_sort") || algorithm.equals("heap_sort")) {
                this.complexity = new Complexity("O(n log n)", algorithm.equals("merge_sort") ? "O(n)" : "O(log n)");
            } else if (algorithm.equals("radix_sort")) {
                this.complexity = new Complexity("O(nk)", "O(n+k)");
            } else {
                this.complexity = new Complexity("unknown", "unknown");
            }
        }
    }

    private static void pushEvent(List<Event> events, int[] arr, List<Integer> highlighted, String category, String event, String description, Integer lineNumber, boolean visualization) {
        if (visualization) {
            events.add(new Event(arr, highlighted, category, event, description, lineNumber));
        }
    }

    public static AlgorithmResult runBubbleSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Bubble Sort", 1, visualization);
        long start = System.nanoTime();
        
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                pushEvent(events, arr, Arrays.asList(j, j + 1), "comparison", "compare", "Comparing elements", 5, visualization);
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                    pushEvent(events, arr, Arrays.asList(j, j + 1), "array_mutation", "swap", "Swapped elements", 8, visualization);
                }
            }
            if (!swapped) break;
        }
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Bubble Sort complete", 12, visualization);
        return new AlgorithmResult("bubble_sort", visualization ? "visualize" : "benchmark", events, (end - start) / 1_000_000.0);
    }

    public static AlgorithmResult runQuickSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Quick Sort", 18, visualization);
        long start = System.nanoTime();
        
        quickSortHelper(arr, 0, arr.length - 1, events, visualization);
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Quick Sort complete", 24, visualization);
        return new AlgorithmResult("quick_sort", visualization ? "visualize" : "benchmark", events, (end - start) / 1_000_000.0);
    }

    private static void quickSortHelper(int[] arr, int low, int high, List<Event> events, boolean visualization) {
        if (low < high) {
            int pi = partition(arr, low, high, events, visualization);
            quickSortHelper(arr, low, pi - 1, events, visualization);
            quickSortHelper(arr, pi + 1, high, events, visualization);
        }
    }

    private static int partition(int[] arr, int low, int high, List<Event> events, boolean visualization) {
        int pivot = arr[high];
        pushEvent(events, arr, Arrays.asList(high), "comparison", "pivot", "Chosen pivot", 2, visualization);
        int i = low - 1;
        for (int j = low; j < high; j++) {
            pushEvent(events, arr, Arrays.asList(j, high), "comparison", "compare", "Comparing with pivot", 5, visualization);
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
                pushEvent(events, arr, Arrays.asList(i, j), "array_mutation", "swap", "Swapped elements", 9, visualization);
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        pushEvent(events, arr, Arrays.asList(i + 1, high), "array_mutation", "partition", "Pivot placed in correct position", 14, visualization);
        return i + 1;
    }

    public static AlgorithmResult runMergeSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Merge Sort", 17, visualization);
        long start = System.nanoTime();
        
        mergeSortHelper(arr, 0, arr.length - 1, events, visualization);
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Merge Sort complete", 24, visualization);
        return new AlgorithmResult("merge_sort", visualization ? "visualize" : "benchmark", events, (end - start) / 1_000_000.0);
    }

    private static void mergeSortHelper(int[] arr, int left, int right, List<Event> events, boolean visualization) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSortHelper(arr, left, mid, events, visualization);
            mergeSortHelper(arr, mid + 1, right, events, visualization);
            merge(arr, left, mid, right, events, visualization);
        }
    }

    private static void merge(int[] arr, int left, int mid, int right, List<Event> events, boolean visualization) {
        int n1 = mid - left + 1;
        int n2 = right - mid;
        int[] L = new int[n1];
        int[] R = new int[n2];
        
        for (int i = 0; i < n1; ++i) L[i] = arr[left + i];
        for (int j = 0; j < n2; ++j) R[j] = arr[mid + 1 + j];
        
        int i = 0, j = 0;
        int k = left;
        while (i < n1 && j < n2) {
            pushEvent(events, arr, Arrays.asList(left + i, mid + 1 + j), "comparison", "compare", "Comparing elements", 10, visualization);
            if (L[i] <= R[j]) {
                arr[k] = L[i];
                i++;
            } else {
                arr[k] = R[j];
                j++;
            }
            pushEvent(events, arr, Arrays.asList(k), "array_mutation", "merge", "Merging element back", 10, visualization);
            k++;
        }
        while (i < n1) {
            arr[k] = L[i];
            pushEvent(events, arr, Arrays.asList(k), "array_mutation", "merge", "Merging remaining left", 13, visualization);
            i++;
            k++;
        }
        while (j < n2) {
            arr[k] = R[j];
            pushEvent(events, arr, Arrays.asList(k), "array_mutation", "merge", "Merging remaining right", 14, visualization);
            j++;
            k++;
        }
    }

    public static AlgorithmResult runInsertionSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Insertion Sort", 1, visualization);
        long start = System.nanoTime();
        
        int n = arr.length;
        for (int i = 1; i < n; ++i) {
            int key = arr[i];
            int j = i - 1;
            pushEvent(events, arr, Arrays.asList(i), "comparison", "pick", "Picking element", 3, visualization);
            
            while (j >= 0 && arr[j] > key) {
                pushEvent(events, arr, Arrays.asList(j, j + 1), "comparison", "compare", "Comparing elements", 5, visualization);
                arr[j + 1] = arr[j];
                pushEvent(events, arr, Arrays.asList(j, j + 1), "array_mutation", "shift", "Shifting element", 6, visualization);
                j = j - 1;
            }
            arr[j + 1] = key;
            pushEvent(events, arr, Arrays.asList(j + 1), "array_mutation", "insert", "Inserted element", 8, visualization);
        }
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Insertion Sort complete", 10, visualization);
        return new AlgorithmResult("insertion_sort", visualization ? "visualize" : "benchmark", events, (end - start) / 1_000_000.0);
    }

    public static AlgorithmResult runSelectionSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Selection Sort", 1, visualization);
        long start = System.nanoTime();
        
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int min_idx = i;
            for (int j = i + 1; j < n; j++) {
                pushEvent(events, arr, Arrays.asList(min_idx, j), "comparison", "compare", "Comparing elements", 6, visualization);
                if (arr[j] < arr[min_idx]) {
                    min_idx = j;
                }
            }
            if (min_idx != i) {
                int temp = arr[min_idx];
                arr[min_idx] = arr[i];
                arr[i] = temp;
                pushEvent(events, arr, Arrays.asList(i, min_idx), "array_mutation", "swap", "Swapped elements", 9, visualization);
            }
        }
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Selection Sort complete", 12, visualization);
        return new AlgorithmResult("selection_sort", visualization ? "visualize" : "benchmark", events, (end - start) / 1_000_000.0);
    }

    public static AlgorithmResult runHeapSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Heap Sort", 13, visualization);
        long start = System.nanoTime();
        
        int n = arr.length;
        
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(arr, n, i, events, visualization);
        }
        
        for (int i = n - 1; i > 0; i--) {
            pushEvent(events, arr, Arrays.asList(0, i), "comparison", "pick", "Picking root", 17, visualization);
            int temp = arr[0];
            arr[0] = arr[i];
            arr[i] = temp;
            pushEvent(events, arr, Arrays.asList(0, i), "array_mutation", "swap", "Swapped root", 19, visualization);
            heapify(arr, i, 0, events, visualization);
        }
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Heap Sort complete", 24, visualization);
        return new AlgorithmResult("heap_sort", visualization ? "visualize" : "benchmark", events, (end - start) / 1_000_000.0);
    }

    private static void heapify(int[] arr, int n, int i, List<Event> events, boolean visualization) {
        int largest = i;
        int l = 2 * i + 1;
        int r = 2 * i + 2;
        
        if (l < n) {
            pushEvent(events, arr, Arrays.asList(largest, l), "comparison", "compare", "Comparing with left child", 3, visualization);
            if (arr[l] > arr[largest]) largest = l;
        }
        if (r < n) {
            pushEvent(events, arr, Arrays.asList(largest, r), "comparison", "compare", "Comparing with right child", 4, visualization);
            if (arr[r] > arr[largest]) largest = r;
        }
        
        if (largest != i) {
            pushEvent(events, arr, Arrays.asList(i, largest), "comparison", "pick", "Swapping child", 6, visualization);
            int swap = arr[i];
            arr[i] = arr[largest];
            arr[largest] = swap;
            pushEvent(events, arr, Arrays.asList(i, largest), "array_mutation", "swap", "Swapped elements", 7, visualization);
            heapify(arr, n, largest, events, visualization);
        }
    }

    public static AlgorithmResult runRadixSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Radix Sort", 1, visualization);
        long start = System.nanoTime();
        
        int n = arr.length;
        if (n > 0) {
            int max = arr[0];
            for (int i = 1; i < n; i++) {
                if (arr[i] > max) max = arr[i];
            }
            
            for (int exp = 1; max / exp > 0; exp *= 10) {
                countSort(arr, n, exp, events, visualization);
            }
        }
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Radix Sort complete", 20, visualization);
        return new AlgorithmResult("radix_sort", visualization ? "visualize" : "benchmark", events, (end - start) / 1_000_000.0);
    }

    private static void countSort(int[] arr, int n, int exp, List<Event> events, boolean visualization) {
        int[] output = new int[n];
        int[] count = new int[10];
        
        for (int i = 0; i < n; i++) {
            pushEvent(events, arr, Arrays.asList(i), "comparison", "count", "Counting digit", 4, visualization);
            count[(arr[i] / exp) % 10]++;
        }
        
        for (int i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        
        for (int i = n - 1; i >= 0; i--) {
            int idx = (arr[i] / exp) % 10;
            output[count[idx] - 1] = arr[i];
            count[idx]--;
        }
        
        for (int i = 0; i < n; i++) {
            arr[i] = output[i];
            pushEvent(events, arr, Arrays.asList(i), "array_mutation", "place", "Placed element", 15, visualization);
        }
    }

    public static AlgorithmResult runShellSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Shell Sort", 1, visualization);
        long start = System.nanoTime();
        
        int n = arr.length;
        for (int gap = n / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < n; i++) {
                int temp = arr[i];
                int j = i;
                while (j >= gap) {
                    pushEvent(events, arr, Arrays.asList(j - gap, i), "comparison", "compare", "Comparing elements", 6, visualization);
                    if (arr[j - gap] > temp) {
                        arr[j] = arr[j - gap];
                        pushEvent(events, arr, Arrays.asList(j), "array_mutation", "shift", "Shifting element", 7, visualization);
                        j -= gap;
                    } else {
                        break;
                    }
                }
                arr[j] = temp;
                pushEvent(events, arr, Arrays.asList(j), "array_mutation", "insert", "Inserted element", 10, visualization);
            }
        }
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Shell Sort complete", 13, visualization);
        return new AlgorithmResult("shell_sort", visualization ? "visualize" : "benchmark", events, (end - start) / 1_000_000.0);
    }
}

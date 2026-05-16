package com.algoverse;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Algorithms {

    public static class Event {
        public List<Integer> values;
        public List<Integer> indices;
        public String category;
        public String event;
        public String description;
        public long timestamp;

        public Event(int[] array, List<Integer> highlighted, String category, String event, String description) {
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

    private static void pushEvent(List<Event> events, int[] arr, List<Integer> highlighted, String category, String event, String description, boolean visualization) {
        if (visualization) {
            events.add(new Event(arr, highlighted, category, event, description));
        }
    }

    public static AlgorithmResult runBubbleSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Bubble Sort", visualization);
        long start = System.nanoTime();
        
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                pushEvent(events, arr, Arrays.asList(j, j + 1), "comparison", "compare", "Comparing elements at index " + j + " and " + (j + 1), visualization);
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                    pushEvent(events, arr, Arrays.asList(j, j + 1), "array_mutation", "swap", "Swapped " + arr[j+1] + " and " + arr[j], visualization);
                }
            }
            if (!swapped) break;
        }
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Bubble Sort complete", visualization);
        return new AlgorithmResult("bubble_sort", visualization ? "visualize" : "benchmark", events, (end - start) / 1_000_000.0);
    }

    public static AlgorithmResult runQuickSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Quick Sort", visualization);
        long start = System.nanoTime();
        
        quickSortHelper(arr, 0, arr.length - 1, events, visualization);
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Quick Sort complete", visualization);
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
        pushEvent(events, arr, Arrays.asList(high), "comparison", "pivot", "Chosen pivot: " + pivot, visualization);
        int i = low - 1;
        for (int j = low; j < high; j++) {
            pushEvent(events, arr, Arrays.asList(j, high), "comparison", "compare", "Comparing " + arr[j] + " with pivot " + pivot, visualization);
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
                pushEvent(events, arr, Arrays.asList(i, j), "array_mutation", "swap", "Swapped " + arr[j] + " and " + arr[i], visualization);
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        pushEvent(events, arr, Arrays.asList(i + 1, high), "array_mutation", "partition", "Placed pivot " + pivot + " at final position", visualization);
        return i + 1;
    }

    public static AlgorithmResult runMergeSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Merge Sort", visualization);
        long start = System.nanoTime();
        
        mergeSortHelper(arr, 0, arr.length - 1, events, visualization);
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Merge Sort complete", visualization);
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
            pushEvent(events, arr, Arrays.asList(left + i, mid + 1 + j), "comparison", "compare", "Comparing elements from sub-arrays", visualization);
            if (L[i] <= R[j]) {
                arr[k] = L[i];
                i++;
            } else {
                arr[k] = R[j];
                j++;
            }
            pushEvent(events, arr, Arrays.asList(k), "array_mutation", "merge", "Merged element " + arr[k] + " back to main array", visualization);
            k++;
        }
        while (i < n1) {
            arr[k] = L[i];
            pushEvent(events, arr, Arrays.asList(k), "array_mutation", "merge", "Copying remaining element " + arr[k] + " from left sub-array", visualization);
            i++;
            k++;
        }
        while (j < n2) {
            arr[k] = R[j];
            pushEvent(events, arr, Arrays.asList(k), "array_mutation", "merge", "Copying remaining element " + arr[k] + " from right sub-array", visualization);
            j++;
            k++;
        }
    }

    public static AlgorithmResult runInsertionSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Insertion Sort", visualization);
        long start = System.nanoTime();
        
        int n = arr.length;
        for (int i = 1; i < n; ++i) {
            int key = arr[i];
            int j = i - 1;
            pushEvent(events, arr, Arrays.asList(i), "comparison", "pick", "Picking element " + key + " to insert", visualization);
            
            while (j >= 0 && arr[j] > key) {
                pushEvent(events, arr, Arrays.asList(j, j + 1), "comparison", "compare", "Comparing " + arr[j] + " with " + key, visualization);
                arr[j + 1] = arr[j];
                pushEvent(events, arr, Arrays.asList(j, j + 1), "array_mutation", "shift", "Shifting " + arr[j] + " to the right", visualization);
                j = j - 1;
            }
            arr[j + 1] = key;
            pushEvent(events, arr, Arrays.asList(j + 1), "array_mutation", "insert", "Inserted " + key + " at index " + (j + 1), visualization);
        }
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Insertion Sort complete", visualization);
        return new AlgorithmResult("insertion_sort", visualization ? "visualize" : "benchmark", events, (end - start) / 1_000_000.0);
    }

    public static AlgorithmResult runSelectionSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Selection Sort", visualization);
        long start = System.nanoTime();
        
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int min_idx = i;
            for (int j = i + 1; j < n; j++) {
                pushEvent(events, arr, Arrays.asList(min_idx, j), "comparison", "compare", "Comparing " + arr[j] + " with current minimum " + arr[min_idx], visualization);
                if (arr[j] < arr[min_idx]) {
                    min_idx = j;
                }
            }
            if (min_idx != i) {
                int temp = arr[min_idx];
                arr[min_idx] = arr[i];
                arr[i] = temp;
                pushEvent(events, arr, Arrays.asList(i, min_idx), "array_mutation", "swap", "Swapped " + arr[min_idx] + " and new minimum " + arr[i], visualization);
            }
        }
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Selection Sort complete", visualization);
        return new AlgorithmResult("selection_sort", visualization ? "visualize" : "benchmark", events, (end - start) / 1_000_000.0);
    }

    public static AlgorithmResult runHeapSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Heap Sort", visualization);
        long start = System.nanoTime();
        
        int n = arr.length;
        
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(arr, n, i, events, visualization);
        }
        
        for (int i = n - 1; i > 0; i--) {
            pushEvent(events, arr, Arrays.asList(0, i), "comparison", "pick", "Picking root element " + arr[0] + " to move to end", visualization);
            int temp = arr[0];
            arr[0] = arr[i];
            arr[i] = temp;
            pushEvent(events, arr, Arrays.asList(0, i), "array_mutation", "swap", "Swapped root with index " + i, visualization);
            heapify(arr, i, 0, events, visualization);
        }
        
        long end = System.nanoTime();
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Heap Sort complete", visualization);
        return new AlgorithmResult("heap_sort", visualization ? "visualize" : "benchmark", events, (end - start) / 1_000_000.0);
    }

    private static void heapify(int[] arr, int n, int i, List<Event> events, boolean visualization) {
        int largest = i;
        int l = 2 * i + 1;
        int r = 2 * i + 2;
        
        if (l < n) {
            pushEvent(events, arr, Arrays.asList(largest, l), "comparison", "compare", "Comparing parent with left child", visualization);
            if (arr[l] > arr[largest]) largest = l;
        }
        if (r < n) {
            pushEvent(events, arr, Arrays.asList(largest, r), "comparison", "compare", "Comparing parent with right child", visualization);
            if (arr[r] > arr[largest]) largest = r;
        }
        
        if (largest != i) {
            pushEvent(events, arr, Arrays.asList(i, largest), "comparison", "pick", "Node at " + i + " is smaller than its child", visualization);
            int swap = arr[i];
            arr[i] = arr[largest];
            arr[largest] = swap;
            pushEvent(events, arr, Arrays.asList(i, largest), "array_mutation", "swap", "Swapped parent with child to maintain heap property", visualization);
            heapify(arr, n, largest, events, visualization);
        }
    }

    public static AlgorithmResult runRadixSort(int[] arr, boolean visualization) {
        List<Event> events = new ArrayList<>();
        pushEvent(events, arr, new ArrayList<>(), "initial", "start", "Starting Radix Sort", visualization);
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
        pushEvent(events, arr, new ArrayList<>(), "final", "end", "Radix Sort complete", visualization);
        return new AlgorithmResult("radix_sort", visualization ? "visualize" : "benchmark", events, (end - start) / 1_000_000.0);
    }

    private static void countSort(int[] arr, int n, int exp, List<Event> events, boolean visualization) {
        int[] output = new int[n];
        int[] count = new int[10];
        
        for (int i = 0; i < n; i++) {
            pushEvent(events, arr, Arrays.asList(i), "comparison", "count", "Counting digit " + ((arr[i] / exp) % 10) + " for element " + arr[i], visualization);
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
            pushEvent(events, arr, Arrays.asList(i), "array_mutation", "place", "Placed " + arr[i] + " based on current digit", visualization);
        }
    }
}

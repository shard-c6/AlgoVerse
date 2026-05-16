using System.Diagnostics;
using System.Text.Json.Serialization;

namespace CSharpService;

public enum AlgorithmMode
{
    visualization,
    benchmark
}

public class StateEvent
{
    [JsonPropertyName("values")]
    public List<int> Values { get; set; } = new();

    [JsonPropertyName("indices")]
    public List<int> Indices { get; set; } = new();

    [JsonPropertyName("category")]
    public string Category { get; set; } = "";

    [JsonPropertyName("event")]
    public string Event { get; set; } = "";

    [JsonPropertyName("description")]
    public string Description { get; set; } = "";

    [JsonPropertyName("timestamp")]
    public long Timestamp { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
}

public class PerformanceMetrics
{
    [JsonPropertyName("time_ms")]
    public double TimeMs { get; set; }

    [JsonPropertyName("comparisons")]
    public object? Comparisons { get; set; } = null;

    [JsonPropertyName("swaps")]
    public object? Swaps { get; set; } = null;
}

public class Complexity
{
    [JsonPropertyName("time")]
    public string Time { get; set; } = "";

    [JsonPropertyName("space")]
    public string Space { get; set; } = "";
}

public class VersionedAlgorithmContract
{
    [JsonPropertyName("version")]
    public string Version { get; set; } = "1.0";

    [JsonPropertyName("language")]
    public string Language { get; set; } = "csharp";

    [JsonPropertyName("algorithm")]
    public string Algorithm { get; set; } = "";

    [JsonPropertyName("mode")]
    public string Mode { get; set; } = "";

    [JsonPropertyName("events")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<StateEvent>? Events { get; set; }

    [JsonPropertyName("metrics")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public PerformanceMetrics? Metrics { get; set; }

    [JsonPropertyName("complexity")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public Complexity? Complexity { get; set; }
}

public class RunRequest
{
    [JsonPropertyName("data")]
    public List<int> Data { get; set; } = new();
}

public class SortingState
{
    public AlgorithmMode Mode { get; set; }
    public List<StateEvent> Events { get; set; } = new();
    
    public void AddEvent(List<int> data, List<int> indices, string category, string eventName, string desc)
    {
        if (Mode == AlgorithmMode.visualization)
        {
            Events.Add(new StateEvent
            {
                Values = new List<int>(data),
                Indices = indices,
                Category = category,
                Event = eventName,
                Description = desc
            });
        }
    }
}

public static class Algorithms
{
    public static VersionedAlgorithmContract RunSort(string algoName, List<int> data, AlgorithmMode mode)
    {
        var stopwatch = Stopwatch.StartNew();

        var state = new SortingState { Mode = mode };
        var arr = new List<int>(data);
        var complexity = new Complexity { Time = "O(n^2)", Space = "O(1)" };

        if (mode == AlgorithmMode.visualization)
        {
            state.AddEvent(arr, new List<int>(), "initial", "start", "Initial state");
        }

        switch (algoName)
        {
            case "bubble_sort":
                BubbleSort(state, arr);
                break;
            case "quick_sort":
                complexity.Time = "O(n log n)";
                QuickSort(state, arr, 0, arr.Count - 1);
                break;
            case "merge_sort":
                complexity.Time = "O(n log n)";
                complexity.Space = "O(n)";
                MergeSort(state, arr, 0, arr.Count - 1);
                break;
            case "insertion_sort":
                InsertionSort(state, arr);
                break;
            case "selection_sort":
                SelectionSort(state, arr);
                break;
            case "heap_sort":
                complexity.Time = "O(n log n)";
                HeapSort(state, arr);
                break;
            case "shell_sort":
                complexity.Time = "O(n log n)";
                ShellSort(state, arr);
                break;
        }

        stopwatch.Stop();

        if (mode == AlgorithmMode.visualization)
        {
            state.AddEvent(arr, new List<int>(), "final", "end", "Final sorted state");
        }

        return new VersionedAlgorithmContract
        {
            Version = "1.0",
            Language = "csharp",
            Algorithm = algoName,
            Mode = mode == AlgorithmMode.visualization ? "visualize" : "benchmark",
            Events = state.Events,
            Metrics = new PerformanceMetrics
            {
                TimeMs = stopwatch.Elapsed.TotalMilliseconds
            },
            Complexity = complexity
        };
    }

    private static void BubbleSort(SortingState state, List<int> data)
    {
        int n = data.Count;
        for (int i = 0; i < n; i++)
        {
            bool swapped = false;
            for (int j = 0; j < n - i - 1; j++)
            {
                state.AddEvent(data, new List<int> { j, j + 1 }, "comparison", "compare", "Comparing elements");
                if (data[j] > data[j + 1])
                {
                    (data[j], data[j + 1]) = (data[j + 1], data[j]);
                    swapped = true;
                    state.AddEvent(data, new List<int> { j, j + 1 }, "array_mutation", "swap", "Swapped elements");
                }
            }
            if (!swapped) break;
        }
    }

    private static int Partition(SortingState state, List<int> data, int low, int high)
    {
        int pivot = data[high];
        int i = low - 1;
        state.AddEvent(data, new List<int> { high }, "comparison", "pivot", $"Pivot chosen: {pivot}");
        for (int j = low; j < high; j++)
        {
            state.AddEvent(data, new List<int> { j, high }, "comparison", "compare", "Comparing with pivot");
            if (data[j] <= pivot)
            {
                i++;
                (data[i], data[j]) = (data[j], data[i]);
                state.AddEvent(data, new List<int> { i, j }, "array_mutation", "swap", "Swapped elements");
            }
        }
        (data[i + 1], data[high]) = (data[high], data[i + 1]);
        state.AddEvent(data, new List<int> { i + 1, high }, "array_mutation", "partition", "Pivot placed in correct position");
        return i + 1;
    }

    private static void QuickSort(SortingState state, List<int> data, int low, int high)
    {
        if (low < high)
        {
            int pi = Partition(state, data, low, high);
            QuickSort(state, data, low, pi - 1);
            QuickSort(state, data, pi + 1, high);
        }
    }

    private static void Merge(SortingState state, List<int> data, int left, int mid, int right)
    {
        int n1 = mid - left + 1;
        int n2 = right - mid;

        var L = new List<int>(n1);
        var R = new List<int>(n2);

        for (int m = 0; m < n1; m++) L.Add(data[left + m]);
        for (int m = 0; m < n2; m++) R.Add(data[mid + 1 + m]);

        int i = 0, j = 0, k = left;

        while (i < n1 && j < n2)
        {
            state.AddEvent(data, new List<int> { left + i, mid + 1 + j }, "comparison", "compare", "Comparing elements from sub-arrays");
            if (L[i] <= R[j])
            {
                data[k] = L[i];
                i++;
            }
            else
            {
                data[k] = R[j];
                j++;
            }
            state.AddEvent(data, new List<int> { k }, "array_mutation", "merge", "Merging element back to main array");
            k++;
        }

        while (i < n1)
        {
            data[k] = L[i];
            state.AddEvent(data, new List<int> { k }, "array_mutation", "merge", "Merging remaining elements");
            i++;
            k++;
        }

        while (j < n2)
        {
            data[k] = R[j];
            state.AddEvent(data, new List<int> { k }, "array_mutation", "merge", "Merging remaining elements");
            j++;
            k++;
        }
    }

    private static void MergeSort(SortingState state, List<int> data, int left, int right)
    {
        if (left < right)
        {
            int mid = left + (right - left) / 2;
            MergeSort(state, data, left, mid);
            MergeSort(state, data, mid + 1, right);
            Merge(state, data, left, mid, right);
        }
    }

    private static void InsertionSort(SortingState state, List<int> data)
    {
        int n = data.Count;
        for (int i = 1; i < n; i++)
        {
            int key = data[i];
            int j = i - 1;
            state.AddEvent(data, new List<int> { i }, "comparison", "select", $"Selecting element {key} to insert");
            while (j >= 0)
            {
                state.AddEvent(data, new List<int> { j }, "comparison", "compare", $"Comparing with {data[j]}");
                if (data[j] > key)
                {
                    data[j + 1] = data[j];
                    state.AddEvent(data, new List<int> { j, j + 1 }, "array_mutation", "shift", "Shifting element to the right");
                    j--;
                }
                else
                {
                    break;
                }
            }
            data[j + 1] = key;
            state.AddEvent(data, new List<int> { j + 1 }, "array_mutation", "insert", $"Inserted {key} at index {j + 1}");
        }
    }

    private static void SelectionSort(SortingState state, List<int> data)
    {
        int n = data.Count;
        for (int i = 0; i < n; i++)
        {
            int minIdx = i;
            state.AddEvent(data, new List<int> { i }, "comparison", "select", $"Finding minimum for index {i}");
            for (int j = i + 1; j < n; j++)
            {
                state.AddEvent(data, new List<int> { minIdx, j }, "comparison", "compare", "Checking for smaller element");
                if (data[j] < data[minIdx])
                {
                    minIdx = j;
                    state.AddEvent(data, new List<int> { minIdx }, "comparison", "new_min", "New minimum found");
                }
            }
            if (minIdx != i)
            {
                (data[i], data[minIdx]) = (data[minIdx], data[i]);
                state.AddEvent(data, new List<int> { i, minIdx }, "array_mutation", "swap", "Swapped minimum into position");
            }
        }
    }

    private static void Heapify(SortingState state, List<int> data, int n, int i)
    {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < n)
        {
            state.AddEvent(data, new List<int> { largest, left }, "comparison", "compare", "Comparing with left child");
            if (data[left] > data[largest])
            {
                largest = left;
            }
        }

        if (right < n)
        {
            state.AddEvent(data, new List<int> { largest, right }, "comparison", "compare", "Comparing with right child");
            if (data[right] > data[largest])
            {
                largest = right;
            }
        }

        if (largest != i)
        {
            (data[i], data[largest]) = (data[largest], data[i]);
            state.AddEvent(data, new List<int> { i, largest }, "array_mutation", "swap", "Heapify: swapping elements");
            Heapify(state, data, n, largest);
        }
    }

    private static void HeapSort(SortingState state, List<int> data)
    {
        int n = data.Count;

        state.AddEvent(data, new List<int>(), "initial", "heapify_start", "Building max heap");
        for (int i = n / 2 - 1; i >= 0; i--)
        {
            Heapify(state, data, n, i);
        }

        for (int i = n - 1; i > 0; i--)
        {
            (data[0], data[i]) = (data[i], data[0]);
            state.AddEvent(data, new List<int> { 0, i }, "array_mutation", "swap", "Swapping root with last element");
            Heapify(state, data, i, 0);
        }
    }

    private static void ShellSort(SortingState state, List<int> data)
    {
        int n = data.Count;
        for (int gap = n / 2; gap > 0; gap /= 2)
        {
            state.AddEvent(data, new List<int>(), "comparison", "gap", $"Current gap: {gap}");
            for (int i = gap; i < n; i++)
            {
                int temp = data[i];
                int j = i;
                state.AddEvent(data, new List<int> { i }, "comparison", "select", $"Current element: {temp}");
                while (j >= gap)
                {
                    state.AddEvent(data, new List<int> { j - gap, j }, "comparison", "compare", $"Comparing elements with gap {gap}");
                    if (data[j - gap] > temp)
                    {
                        data[j] = data[j - gap];
                        state.AddEvent(data, new List<int> { j - gap, j }, "array_mutation", "shift", "Shifting element");
                        j -= gap;
                    }
                    else
                    {
                        break;
                    }
                }
                data[j] = temp;
                state.AddEvent(data, new List<int> { j }, "array_mutation", "insert", "Placed element in its gap position");
            }
        }
    }
}

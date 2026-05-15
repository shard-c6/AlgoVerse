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
    [JsonPropertyName("state")]
    public List<int> State { get; set; } = new();

    [JsonPropertyName("event")]
    public string Event { get; set; } = "";

    [JsonPropertyName("description")]
    public string Description { get; set; } = "";
}

public class PerformanceMetrics
{
    [JsonPropertyName("time_ms")]
    public double TimeMs { get; set; }

    [JsonPropertyName("comparisons")]
    public int Comparisons { get; set; }

    [JsonPropertyName("swaps")]
    public int Swaps { get; set; }
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

    [JsonPropertyName("final_state")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<int>? FinalState { get; set; }

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
    public int Comparisons { get; set; }
    public int Swaps { get; set; }

    public bool Compare(int a, int b)
    {
        Comparisons++;
        return a < b;
    }

    public void Swap(List<int> data, int i, int j)
    {
        (data[j], data[i]) = (data[i], data[j]);
        Swaps++;
        
        if (Mode == AlgorithmMode.visualization)
        {
            Events.Add(new StateEvent
            {
                State = new List<int>(data),
                Event = "swap",
                Description = "Swapped elements"
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

        return new VersionedAlgorithmContract
        {
            Version = "1.0",
            Language = "csharp",
            Algorithm = algoName,
            Mode = mode.ToString(),
            FinalState = mode == AlgorithmMode.benchmark ? arr : null,
            Events = state.Events,
            Metrics = new PerformanceMetrics
            {
                TimeMs = stopwatch.Elapsed.TotalMilliseconds,
                Comparisons = state.Comparisons,
                Swaps = state.Swaps
            },
            Complexity = complexity
        };
    }

    private static void BubbleSort(SortingState state, List<int> data)
    {
        int n = data.Count;
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n - i - 1; j++)
            {
                state.Comparisons++;
                if (data[j] > data[j + 1])
                {
                    state.Swap(data, j, j + 1);
                }
            }
        }
    }

    private static int Partition(SortingState state, List<int> data, int low, int high)
    {
        int pivot = data[high];
        int i = low - 1;
        for (int j = low; j < high; j++)
        {
            state.Comparisons++;
            if (data[j] <= pivot)
            {
                i++;
                state.Swap(data, i, j);
            }
        }
        state.Swap(data, i + 1, high);
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
            state.Comparisons++;
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
            if (state.Mode == AlgorithmMode.visualization)
            {
                state.Events.Add(new StateEvent
                {
                    State = new List<int>(data),
                    Event = "merge",
                    Description = "Merged elements"
                });
            }
            k++;
        }

        while (i < n1)
        {
            data[k] = L[i];
            i++;
            k++;
            if (state.Mode == AlgorithmMode.visualization)
            {
                state.Events.Add(new StateEvent
                {
                    State = new List<int>(data),
                    Event = "merge",
                    Description = "Merged elements"
                });
            }
        }

        while (j < n2)
        {
            data[k] = R[j];
            j++;
            k++;
            if (state.Mode == AlgorithmMode.visualization)
            {
                state.Events.Add(new StateEvent
                {
                    State = new List<int>(data),
                    Event = "merge",
                    Description = "Merged elements"
                });
            }
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
            while (j >= 0)
            {
                state.Comparisons++;
                if (data[j] > key)
                {
                    data[j + 1] = data[j];
                    j--;
                    if (state.Mode == AlgorithmMode.visualization)
                    {
                        state.Events.Add(new StateEvent
                        {
                            State = new List<int>(data),
                            Event = "shift",
                            Description = "Shifted element"
                        });
                    }
                }
                else
                {
                    break;
                }
            }
            data[j + 1] = key;
            if (state.Mode == AlgorithmMode.visualization)
            {
                state.Events.Add(new StateEvent
                {
                    State = new List<int>(data),
                    Event = "insert",
                    Description = "Inserted element"
                });
            }
        }
    }

    private static void SelectionSort(SortingState state, List<int> data)
    {
        int n = data.Count;
        for (int i = 0; i < n; i++)
        {
            int minIdx = i;
            for (int j = i + 1; j < n; j++)
            {
                state.Comparisons++;
                if (data[j] < data[minIdx])
                {
                    minIdx = j;
                }
            }
            if (minIdx != i)
            {
                state.Swap(data, i, minIdx);
            }
        }
    }

    private static void Heapify(SortingState state, List<int> data, int n, int i)
    {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        state.Comparisons++;
        if (left < n && data[left] > data[largest])
        {
            largest = left;
        }

        state.Comparisons++;
        if (right < n && data[right] > data[largest])
        {
            largest = right;
        }

        if (largest != i)
        {
            state.Swap(data, i, largest);
            Heapify(state, data, n, largest);
        }
    }

    private static void HeapSort(SortingState state, List<int> data)
    {
        int n = data.Count;

        for (int i = n / 2 - 1; i >= 0; i--)
        {
            Heapify(state, data, n, i);
        }

        for (int i = n - 1; i > 0; i--)
        {
            state.Swap(data, 0, i);
            Heapify(state, data, i, 0);
        }
    }

    private static void ShellSort(SortingState state, List<int> data)
    {
        int n = data.Count;
        for (int gap = n / 2; gap > 0; gap /= 2)
        {
            for (int i = gap; i < n; i++)
            {
                int temp = data[i];
                int j = i;
                while (j >= gap)
                {
                    state.Comparisons++;
                    if (data[j - gap] > temp)
                    {
                        data[j] = data[j - gap];
                        j -= gap;
                        if (state.Mode == AlgorithmMode.visualization)
                        {
                            state.Events.Add(new StateEvent
                            {
                                State = new List<int>(data),
                                Event = "shift",
                                Description = "Shifted element"
                            });
                        }
                    }
                    else
                    {
                        break;
                    }
                }
                data[j] = temp;
                if (state.Mode == AlgorithmMode.visualization)
                {
                    state.Events.Add(new StateEvent
                    {
                        State = new List<int>(data),
                        Event = "insert",
                        Description = "Inserted element"
                    });
                }
            }
        }
    }
}

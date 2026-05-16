#include "Algorithms.hpp"
#include <chrono>
#include <algorithm>
#include <iostream>

using namespace std::chrono;

void add_step_c(json& events, const int* arr, int n, const std::vector<int>& highlighted, const std::string& category, const std::string& event, const std::string& desc, bool viz) {
    if (!viz) return;
    json e;
    e["values"] = std::vector<int>(arr, arr + n);
    e["indices"] = highlighted;
    e["category"] = category;
    e["event"] = event;
    e["description"] = desc;
    e["timestamp"] = duration_cast<milliseconds>(system_clock::now().time_since_epoch()).count();
    events.push_back(e);
}

void add_step_cpp(json& events, const std::vector<int>& arr, const std::vector<int>& highlighted, const std::string& category, const std::string& event, const std::string& desc, bool viz) {
    if (!viz) return;
    json e;
    e["values"] = arr;
    e["indices"] = highlighted;
    e["category"] = category;
    e["event"] = event;
    e["description"] = desc;
    e["timestamp"] = duration_cast<milliseconds>(system_clock::now().time_since_epoch()).count();
    events.push_back(e);
}

// ================= C IMPLEMENTATIONS (Using raw pointers) =================

void c_bubble_sort(int* arr, int n, json& events, bool viz) {
    add_step_c(events, arr, n, {}, "initial", "start", "Starting Bubble Sort", viz);
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            add_step_c(events, arr, n, {j, j + 1}, "comparison", "compare", "Comparing elements", viz);
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
                add_step_c(events, arr, n, {j, j + 1}, "array_mutation", "swap", "Swapped elements", viz);
            }
        }
        if (!swapped) break;
    }
    add_step_c(events, arr, n, {}, "final", "end", "Bubble Sort complete", viz);
}

void c_quick_sort_helper(int* arr, int n, int low, int high, json& events, bool viz) {
    if (low < high) {
        int pivot = arr[high];
        int i = low - 1;
        add_step_c(events, arr, n, {high}, "comparison", "pivot", "Pivot chosen", viz);
        for (int j = low; j < high; j++) {
            add_step_c(events, arr, n, {j, high}, "comparison", "compare", "Comparing with pivot", viz);
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
                add_step_c(events, arr, n, {i, j}, "array_mutation", "swap", "Swapped elements", viz);
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        add_step_c(events, arr, n, {i + 1, high}, "array_mutation", "partition", "Pivot placed in correct position", viz);
        int pi = i + 1;
        
        c_quick_sort_helper(arr, n, low, pi - 1, events, viz);
        c_quick_sort_helper(arr, n, pi + 1, high, events, viz);
    }
}

void c_merge(int* arr, int n, int left, int mid, int right, json& events, bool viz) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    int* L = new int[n1];
    int* R = new int[n2];
    
    for (int i = 0; i < n1; i++) L[i] = arr[left + i];
    for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];
    
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        add_step_c(events, arr, n, {left + i, mid + 1 + j}, "comparison", "compare", "Comparing sub-arrays", viz);
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        add_step_c(events, arr, n, {k}, "array_mutation", "merge", "Merging element back to main array", viz);
        k++;
    }
    while (i < n1) {
        arr[k] = L[i];
        add_step_c(events, arr, n, {k}, "array_mutation", "merge", "Merging remaining elements", viz);
        i++; k++;
    }
    while (j < n2) {
        arr[k] = R[j];
        add_step_c(events, arr, n, {k}, "array_mutation", "merge", "Merging remaining elements", viz);
        j++; k++;
    }
    delete[] L;
    delete[] R;
}

void c_merge_sort_helper(int* arr, int n, int left, int right, json& events, bool viz) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        c_merge_sort_helper(arr, n, left, mid, events, viz);
        c_merge_sort_helper(arr, n, mid + 1, right, events, viz);
        c_merge(arr, n, left, mid, right, events, viz);
    }
}

void c_insertion_sort(int* arr, int n, json& events, bool viz) {
    add_step_c(events, arr, n, {}, "initial", "start", "Starting Insertion Sort", viz);
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        add_step_c(events, arr, n, {i}, "comparison", "select", "Selecting element to insert", viz);
        while (j >= 0 && arr[j] > key) {
            add_step_c(events, arr, n, {j, j + 1}, "comparison", "compare", "Comparing elements", viz);
            arr[j + 1] = arr[j];
            add_step_c(events, arr, n, {j, j + 1}, "array_mutation", "shift", "Shifting element to the right", viz);
            j = j - 1;
        }
        arr[j + 1] = key;
        add_step_c(events, arr, n, {j + 1}, "array_mutation", "insert", "Inserted element in correct position", viz);
    }
    add_step_c(events, arr, n, {}, "final", "end", "Insertion Sort complete", viz);
}

void c_selection_sort(int* arr, int n, json& events, bool viz) {
    add_step_c(events, arr, n, {}, "initial", "start", "Starting Selection Sort", viz);
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            add_step_c(events, arr, n, {min_idx, j}, "comparison", "compare", "Finding minimum", viz);
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
                add_step_c(events, arr, n, {min_idx}, "comparison", "new_min", "New minimum found", viz);
            }
        }
        if (min_idx != i) {
            int temp = arr[min_idx];
            arr[min_idx] = arr[i];
            arr[i] = temp;
            add_step_c(events, arr, n, {i, min_idx}, "array_mutation", "swap", "Swapped minimum into position", viz);
        }
    }
    add_step_c(events, arr, n, {}, "final", "end", "Selection Sort complete", viz);
}

void c_heapify(int* arr, int n_total, int n, int i, json& events, bool viz) {
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;
    
    if (l < n) {
        add_step_c(events, arr, n_total, {largest, l}, "comparison", "compare", "Comparing with left child", viz);
        if (arr[l] > arr[largest]) largest = l;
    }
    if (r < n) {
        add_step_c(events, arr, n_total, {largest, r}, "comparison", "compare", "Comparing with right child", viz);
        if (arr[r] > arr[largest]) largest = r;
    }
    
    if (largest != i) {
        int temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        add_step_c(events, arr, n_total, {i, largest}, "array_mutation", "swap", "Heapify: swapping elements", viz);
        c_heapify(arr, n_total, n, largest, events, viz);
    }
}

void c_heap_sort(int* arr, int n, json& events, bool viz) {
    add_step_c(events, arr, n, {}, "initial", "start", "Starting Heap Sort", viz);
    for (int i = n / 2 - 1; i >= 0; i--) {
        c_heapify(arr, n, n, i, events, viz);
    }
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        add_step_c(events, arr, n, {0, i}, "array_mutation", "swap", "Swapping root with last element", viz);
        c_heapify(arr, n, i, 0, events, viz);
    }
    add_step_c(events, arr, n, {}, "final", "end", "Heap Sort complete", viz);
}

void c_count_sort(int* arr, int n, int exp, json& events, bool viz) {
    int* output = new int[n];
    int count[10] = {0};
    
    for (int i = 0; i < n; i++) {
        add_step_c(events, arr, n, {i}, "comparison", "count", "Counting occurrence", viz);
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
        add_step_c(events, arr, n, {i}, "array_mutation", "reconstruct", "Copying back to main array", viz);
    }
    delete[] output;
}

void c_radix_sort(int* arr, int n, json& events, bool viz) {
    add_step_c(events, arr, n, {}, "initial", "start", "Starting Radix Sort", viz);
    if (n > 0) {
        int max_val = arr[0];
        for (int i = 1; i < n; i++) {
            if (arr[i] > max_val) max_val = arr[i];
        }
        for (int exp = 1; max_val / exp > 0; exp *= 10) {
            c_count_sort(arr, n, exp, events, viz);
        }
    }
    add_step_c(events, arr, n, {}, "final", "end", "Radix Sort complete", viz);
}

// ================= CPP IMPLEMENTATIONS (Using STL) =================

void cpp_bubble_sort(std::vector<int>& arr, json& events, bool viz) {
    add_step_cpp(events, arr, {}, "initial", "start", "Starting Bubble Sort", viz);
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            add_step_cpp(events, arr, {j, j + 1}, "comparison", "compare", "Comparing elements", viz);
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
                swapped = true;
                add_step_cpp(events, arr, {j, j + 1}, "array_mutation", "swap", "Swapped elements", viz);
            }
        }
        if (!swapped) break;
    }
    add_step_cpp(events, arr, {}, "final", "end", "Bubble Sort complete", viz);
}

void cpp_quick_sort_helper(std::vector<int>& arr, int low, int high, json& events, bool viz) {
    if (low < high) {
        int pivot = arr[high];
        int i = low - 1;
        add_step_cpp(events, arr, {high}, "comparison", "pivot", "Pivot chosen", viz);
        for (int j = low; j < high; j++) {
            add_step_cpp(events, arr, {j, high}, "comparison", "compare", "Comparing with pivot", viz);
            if (arr[j] < pivot) {
                i++;
                std::swap(arr[i], arr[j]);
                add_step_cpp(events, arr, {i, j}, "array_mutation", "swap", "Swapped elements", viz);
            }
        }
        std::swap(arr[i + 1], arr[high]);
        add_step_cpp(events, arr, {i + 1, high}, "array_mutation", "partition", "Pivot placed in correct position", viz);
        int pi = i + 1;
        
        cpp_quick_sort_helper(arr, low, pi - 1, events, viz);
        cpp_quick_sort_helper(arr, pi + 1, high, events, viz);
    }
}

void cpp_merge(std::vector<int>& arr, int left, int mid, int right, json& events, bool viz) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    std::vector<int> L(arr.begin() + left, arr.begin() + mid + 1);
    std::vector<int> R(arr.begin() + mid + 1, arr.begin() + right + 1);
    
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        add_step_cpp(events, arr, {left + i, mid + 1 + j}, "comparison", "compare", "Comparing sub-arrays", viz);
        if (L[i] <= R[j]) {
            arr[k++] = L[i++];
        } else {
            arr[k++] = R[j++];
        }
        add_step_cpp(events, arr, {k - 1}, "array_mutation", "merge", "Merging element back to main array", viz);
    }
    while (i < n1) { 
        arr[k++] = L[i++]; 
        add_step_cpp(events, arr, {k - 1}, "array_mutation", "merge", "Merging remaining elements", viz); 
    }
    while (j < n2) { 
        arr[k++] = R[j++]; 
        add_step_cpp(events, arr, {k - 1}, "array_mutation", "merge", "Merging remaining elements", viz); 
    }
}

void cpp_merge_sort_helper(std::vector<int>& arr, int left, int right, json& events, bool viz) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        cpp_merge_sort_helper(arr, left, mid, events, viz);
        cpp_merge_sort_helper(arr, mid + 1, right, events, viz);
        cpp_merge(arr, left, mid, right, events, viz);
    }
}

void cpp_insertion_sort(std::vector<int>& arr, json& events, bool viz) {
    add_step_cpp(events, arr, {}, "initial", "start", "Starting Insertion Sort", viz);
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        add_step_cpp(events, arr, {i}, "comparison", "select", "Selecting element to insert", viz);
        while (j >= 0 && arr[j] > key) {
            add_step_cpp(events, arr, {j, j + 1}, "comparison", "compare", "Comparing elements", viz);
            arr[j + 1] = arr[j];
            add_step_cpp(events, arr, {j, j + 1}, "array_mutation", "shift", "Shifting element to the right", viz);
            j = j - 1;
        }
        arr[j + 1] = key;
        add_step_cpp(events, arr, {j + 1}, "array_mutation", "insert", "Inserted element in correct position", viz);
    }
    add_step_cpp(events, arr, {}, "final", "end", "Insertion Sort complete", viz);
}

void cpp_selection_sort(std::vector<int>& arr, json& events, bool viz) {
    add_step_cpp(events, arr, {}, "initial", "start", "Starting Selection Sort", viz);
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            add_step_cpp(events, arr, {min_idx, j}, "comparison", "compare", "Finding minimum", viz);
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
                add_step_cpp(events, arr, {min_idx}, "comparison", "new_min", "New minimum found", viz);
            }
        }
        if (min_idx != i) {
            std::swap(arr[i], arr[min_idx]);
            add_step_cpp(events, arr, {i, min_idx}, "array_mutation", "swap", "Swapped minimum into position", viz);
        }
    }
    add_step_cpp(events, arr, {}, "final", "end", "Selection Sort complete", viz);
}

void cpp_heapify(std::vector<int>& arr, int n, int i, json& events, bool viz) {
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;
    
    if (l < n) {
        add_step_cpp(events, arr, {largest, l}, "comparison", "compare", "Comparing with left child", viz);
        if (arr[l] > arr[largest]) largest = l;
    }
    if (r < n) {
        add_step_cpp(events, arr, {largest, r}, "comparison", "compare", "Comparing with right child", viz);
        if (arr[r] > arr[largest]) largest = r;
    }
    
    if (largest != i) {
        std::swap(arr[i], arr[largest]);
        add_step_cpp(events, arr, {i, largest}, "array_mutation", "swap", "Heapify: swapping elements", viz);
        cpp_heapify(arr, n, largest, events, viz);
    }
}

void cpp_heap_sort(std::vector<int>& arr, json& events, bool viz) {
    add_step_cpp(events, arr, {}, "initial", "start", "Starting Heap Sort", viz);
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; i--) {
        cpp_heapify(arr, n, i, events, viz);
    }
    for (int i = n - 1; i > 0; i--) {
        std::swap(arr[0], arr[i]);
        add_step_cpp(events, arr, {0, i}, "array_mutation", "swap", "Swapping root with last element", viz);
        cpp_heapify(arr, i, 0, events, viz);
    }
    add_step_cpp(events, arr, {}, "final", "end", "Heap Sort complete", viz);
}

void cpp_count_sort(std::vector<int>& arr, int exp, json& events, bool viz) {
    int n = arr.size();
    std::vector<int> output(n);
    std::vector<int> count(10, 0);
    
    for (int i = 0; i < n; i++) {
        add_step_cpp(events, arr, {i}, "comparison", "count", "Counting occurrence", viz);
        count[(arr[i] / exp) % 10]++;
    }
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--) {
        int idx = (arr[i] / exp) % 10;
        output[count[idx] - 1] = arr[i];
        count[idx]--;
    }
    for (int i = 0; i < n; i++) {
        arr[i] = output[i];
        add_step_cpp(events, arr, {i}, "array_mutation", "reconstruct", "Copying back to main array", viz);
    }
}

void cpp_radix_sort(std::vector<int>& arr, json& events, bool viz) {
    add_step_cpp(events, arr, {}, "initial", "start", "Starting Radix Sort", viz);
    int n = arr.size();
    if (n > 0) {
        int max_val = *std::max_element(arr.begin(), arr.end());
        for (int exp = 1; max_val / exp > 0; exp *= 10) {
            cpp_count_sort(arr, exp, events, viz);
        }
    }
    add_step_cpp(events, arr, {}, "final", "end", "Radix Sort complete", viz);
}

json create_contract(const std::string& algo, const std::string& lang, const std::string& mode, const json& events, double duration_ms) {
    json result;
    result["version"] = "1.0";
    result["language"] = lang;
    result["algorithm"] = algo;
    result["mode"] = mode;
    result["events"] = events;
    result["metrics"] = {
        {"time_ms", duration_ms},
        {"comparisons", nullptr},
        {"swaps", nullptr}
    };
    
    json complexity;
    if (algo == "bubble_sort" || algo == "insertion_sort" || algo == "selection_sort") {
        complexity = {{"time", "O(n^2)"}, {"space", "O(1)"}};
    } else if (algo == "quick_sort" || algo == "merge_sort" || algo == "heap_sort") {
        complexity = {{"time", "O(n log n)"}, {"space", algo == "merge_sort" ? "O(n)" : "O(log n)"}};
    } else if (algo == "radix_sort") {
        complexity = {{"time", "O(nk)"}, {"space", "O(n+k)"}};
    } else {
        complexity = {{"time", "unknown"}, {"space", "unknown"}};
    }
    result["complexity"] = complexity;
    
    return result;
}

json run_c_algorithm(const std::string& algo, std::vector<int> array, bool viz) {
    json events = json::array();
    int n = array.size();
    int* arr = new int[n];
    for (int i = 0; i < n; i++) arr[i] = array[i];

    auto start = high_resolution_clock::now();

    if (algo == "bubble_sort") c_bubble_sort(arr, n, events, viz);
    else if (algo == "quick_sort") { add_step_c(events, arr, n, {}, viz); c_quick_sort_helper(arr, n, 0, n - 1, events, viz); add_step_c(events, arr, n, {}, viz); }
    else if (algo == "merge_sort") { add_step_c(events, arr, n, {}, viz); c_merge_sort_helper(arr, n, 0, n - 1, events, viz); add_step_c(events, arr, n, {}, viz); }
    else if (algo == "insertion_sort") c_insertion_sort(arr, n, events, viz);
    else if (algo == "selection_sort") c_selection_sort(arr, n, events, viz);
    else if (algo == "heap_sort") c_heap_sort(arr, n, events, viz);
    else if (algo == "radix_sort") c_radix_sort(arr, n, events, viz);

    auto end = high_resolution_clock::now();
    double duration = duration_cast<nanoseconds>(end - start).count() / 1e6;

    delete[] arr;

    return create_contract(algo, "c", viz ? "visualize" : "benchmark", events, duration);
}

json run_cpp_algorithm(const std::string& algo, std::vector<int> array, bool viz) {
    json events = json::array();
    
    auto start = high_resolution_clock::now();

    if (algo == "bubble_sort") cpp_bubble_sort(array, events, viz);
    else if (algo == "quick_sort") { add_step_cpp(events, array, {}, viz); cpp_quick_sort_helper(array, 0, array.size() - 1, events, viz); add_step_cpp(events, array, {}, viz); }
    else if (algo == "merge_sort") { add_step_cpp(events, array, {}, viz); cpp_merge_sort_helper(array, 0, array.size() - 1, events, viz); add_step_cpp(events, array, {}, viz); }
    else if (algo == "insertion_sort") cpp_insertion_sort(array, events, viz);
    else if (algo == "selection_sort") cpp_selection_sort(array, events, viz);
    else if (algo == "heap_sort") cpp_heap_sort(array, events, viz);
    else if (algo == "radix_sort") cpp_radix_sort(array, events, viz);

    auto end = high_resolution_clock::now();
    double duration = duration_cast<nanoseconds>(end - start).count() / 1e6;

    return create_contract(algo, "cpp", viz ? "visualize" : "benchmark", events, duration);
}

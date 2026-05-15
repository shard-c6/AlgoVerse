export const algorithmSnippets: Record<string, Record<string, string>> = {
  bubble_sort: {
    python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]`,
    julia: `function bubble_sort!(arr)
    n = length(arr)
    for i in 1:n
        for j in 1:(n - i)
            if arr[j] > arr[j+1]
                arr[j], arr[j+1] = arr[j+1], arr[j]
            end
        end
    end
end`,
    rust: `fn bubble_sort(data: &mut Vec<i32>) {
    let n = data.len();
    for i in 0..n {
        for j in 0..n.saturating_sub(i).saturating_sub(1) {
            if data[j] > data[j + 1] {
                data.swap(j, j + 1);
            }
        }
    }
}`
  },
  quick_sort: {
    python: `def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)`,
    julia: `function partition!(arr, low, high)
    pivot = arr[high]
    i = low - 1
    for j in low:high-1
        if arr[j] <= pivot
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
        end
    end
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1
end

function quick_sort!(arr, low, high)
    if low < high
        pi = partition!(arr, low, high)
        quick_sort!(arr, low, pi - 1)
        quick_sort!(arr, pi + 1, high)
    end
end`,
    rust: `fn partition(data: &mut Vec<i32>, low: usize, high: usize) -> usize {
    let pivot = data[high];
    let mut i = low;
    for j in low..high {
        if data[j] < pivot {
            data.swap(i, j);
            i += 1;
        }
    }
    data.swap(i, high);
    i
}

fn quick_sort_helper(data: &mut Vec<i32>, low: usize, high: usize) {
    if low < high {
        let pivot_idx = partition(data, low, high);
        if pivot_idx > 0 {
            quick_sort_helper(data, low, pivot_idx - 1);
        }
        quick_sort_helper(data, pivot_idx + 1, high);
    }
}`
  },
  merge_sort: {
    python: `def merge(arr, l, m, r):
    left = arr[l:m+1]
    right = arr[m+1:r+1]
    i = j = 0
    k = l
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            arr[k] = left[i]
            i += 1
        else:
            arr[k] = right[j]
            j += 1
        k += 1

    while i < len(left):
        arr[k] = left[i]
        i += 1
        k += 1

    while j < len(right):
        arr[k] = right[j]
        j += 1
        k += 1

def merge_sort(arr, l, r):
    if l < r:
        m = (l + r) // 2
        merge_sort(arr, l, m)
        merge_sort(arr, m + 1, r)
        merge(arr, l, m, r)`,
    julia: `function merge!(arr, l, m, r)
    left_arr = arr[l:m]
    right_arr = arr[m+1:r]
    i = j = 1
    k = l
    
    while i <= length(left_arr) && j <= length(right_arr)
        if left_arr[i] <= right_arr[j]
            arr[k] = left_arr[i]
            i += 1
        else
            arr[k] = right_arr[j]
            j += 1
        end
        k += 1
    end

    while i <= length(left_arr)
        arr[k] = left_arr[i]
        i += 1
        k += 1
    end

    while j <= length(right_arr)
        arr[k] = right_arr[j]
        j += 1
        k += 1
    end
end

function merge_sort!(arr, l, r)
    if l < r
        m = floor(Int, (l + r) / 2)
        merge_sort!(arr, l, m)
        merge_sort!(arr, m + 1, r)
        merge!(arr, l, m, r)
    end
end`,
    rust: `fn merge(data: &mut Vec<i32>, left: usize, mid: usize, right: usize) {
    let mut temp = Vec::with_capacity(right - left + 1);
    let mut i = left;
    let mut j = mid + 1;

    while i <= mid && j <= right {
        if data[i] <= data[j] {
            temp.push(data[i]);
            i += 1;
        } else {
            temp.push(data[j]);
            j += 1;
        }
    }

    while i <= mid {
        temp.push(data[i]);
        i += 1;
    }
    while j <= right {
        temp.push(data[j]);
        j += 1;
    }

    for (k, &val) in temp.iter().enumerate() {
        data[left + k] = val;
    }
}

fn merge_sort_helper(data: &mut Vec<i32>, left: usize, right: usize) {
    if left < right {
        let mid = left + (right - left) / 2;
        merge_sort_helper(data, left, mid);
        merge_sort_helper(data, mid + 1, right);
        merge(data, left, mid, right);
    }
}`
  },
  insertion_sort: {
    python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key`,
    julia: `function insertion_sort!(arr)
    n = length(arr)
    for i in 2:n
        key = arr[i]
        j = i - 1
        while j >= 1 && arr[j] > key
            arr[j+1] = arr[j]
            j -= 1
        end
        arr[j+1] = key
    end
end`,
    rust: `fn insertion_sort(data: &mut Vec<i32>) {
    let n = data.len();
    for i in 1..n {
        let key = data[i];
        let mut j = i;
        
        while j > 0 && data[j - 1] > key {
            data[j] = data[j - 1];
            j -= 1;
        }
        data[j] = key;
    }
}`
  },
  selection_sort: {
    python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
    julia: `function selection_sort!(arr)
    n = length(arr)
    for i in 1:n
        min_idx = i
        for j in (i+1):n
            if arr[j] < arr[min_idx]
                min_idx = j
            end
        end
        if min_idx != i
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
        end
    end
end`,
    rust: `fn selection_sort(data: &mut Vec<i32>) {
    let n = data.len();
    for i in 0..n {
        let mut min_idx = i;
        for j in (i + 1)..n {
            if data[j] < data[min_idx] {
                min_idx = j;
            }
        }
        if min_idx != i {
            data.swap(i, min_idx);
        }
    }
}`
  },
  heap_sort: {
    python: `def heapify(arr, n, i):
    largest = i
    l = 2 * i + 1
    r = 2 * i + 2

    if l < n and arr[l] > arr[largest]:
        largest = l

    if r < n and arr[r] > arr[largest]:
        largest = r

    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)

    for i in range(n - 1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)`,
    julia: `function heapify!(arr, n, i)
    largest = i
    l = 2 * i
    r = 2 * i + 1

    if l <= n && arr[l] > arr[largest]
        largest = l
    end

    if r <= n && arr[r] > arr[largest]
        largest = r
    end

    if largest != i
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify!(arr, n, largest)
    end
end

function heap_sort!(arr)
    n = length(arr)
    for i in floor(Int, n/2):-1:1
        heapify!(arr, n, i)
    end

    for i in n:-1:2
        arr[i], arr[1] = arr[1], arr[i]
        heapify!(arr, i-1, 1)
    end
end`,
    rust: `fn heapify(data: &mut Vec<i32>, n: usize, i: usize) {
    let mut largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    if left < n && data[left] > data[largest] {
        largest = left;
    }

    if right < n && data[right] > data[largest] {
        largest = right;
    }

    if largest != i {
        data.swap(i, largest);
        heapify(data, n, largest);
    }
}

fn heap_sort(data: &mut Vec<i32>) {
    let n = data.len();
    if n == 0 { return; }

    for i in (0..n / 2).rev() {
        heapify(data, n, i);
    }

    for i in (1..n).rev() {
        data.swap(0, i);
        heapify(data, i, 0);
    }
}`
  },
  shell_sort: {
    python: `def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2`,
    julia: `function shell_sort!(arr)
    n = length(arr)
    gap = floor(Int, n/2)
    
    while gap > 0
        for i in (gap+1):n
            temp = arr[i]
            j = i
            while j > gap && arr[j - gap] > temp
                arr[j] = arr[j - gap]
                j -= gap
            end
            arr[j] = temp
        end
        gap = floor(Int, gap/2)
    end
end`,
    rust: `fn shell_sort(data: &mut Vec<i32>) {
    let n = data.len();
    let mut gap = n / 2;

    while gap > 0 {
        for i in gap..n {
            let temp = data[i];
            let mut j = i;

            while j >= gap && data[j - gap] > temp {
                data[j] = data[j - gap];
                j -= gap;
            }
            data[j] = temp;
        }
        gap /= 2;
    }
}`
  }
};

use crate::contracts::*;
use std::time::Instant;

pub fn get_complexity(algo: &str) -> AlgorithmComplexity {
    match algo {
        "bubble_sort" | "insertion_sort" | "selection_sort" => AlgorithmComplexity {
            time: "O(n^2)".to_string(),
            space: "O(1)".to_string(),
        },
        "quick_sort" | "merge_sort" | "heap_sort" | "shell_sort" => AlgorithmComplexity {
            time: "O(n log n)".to_string(),
            space: "O(log n)".to_string(),
        },
        _ => AlgorithmComplexity {
            time: "O(?)".to_string(),
            space: "O(?)".to_string(),
        },
    }
}

fn bubble_sort(data: &mut Vec<i32>, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    let n = data.len();
    for i in 0..n {
        for j in 0..n.saturating_sub(i).saturating_sub(1) {
            *comps += 1;
            if matches!(mode, AlgorithmMode::Visualization) {
                events.push(AlgorithmEvent {
                    timestamp: 0.0,
                    category: EventCategory::Comparison,
                    event: "compare".to_string(),
                    indices: Some(vec![j, j + 1]),
                    values: Some(vec![serde_json::json!(data[j]), serde_json::json!(data[j + 1])]),
                    metadata: None,
                });
            }
            if data[j] > data[j + 1] {
                data.swap(j, j + 1);
                *swaps += 1;
                if matches!(mode, AlgorithmMode::Visualization) {
                    events.push(AlgorithmEvent {
                        timestamp: 0.0,
                        category: EventCategory::ArrayMutation,
                        event: "swap".to_string(),
                        indices: Some(vec![j, j + 1]),
                        values: Some(vec![serde_json::json!(data[j]), serde_json::json!(data[j + 1])]),
                        metadata: None,
                    });
                }
            }
        }
    }
}

fn quick_sort_helper(data: &mut Vec<i32>, low: usize, high: usize, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    if low < high {
        let pivot_idx = partition(data, low, high, mode, events, comps, swaps);
        if pivot_idx > 0 {
            quick_sort_helper(data, low, pivot_idx - 1, mode, events, comps, swaps);
        }
        quick_sort_helper(data, pivot_idx + 1, high, mode, events, comps, swaps);
    }
}

fn partition(data: &mut Vec<i32>, low: usize, high: usize, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) -> usize {
    let pivot = data[high];
    let mut i = low;

    for j in low..high {
        *comps += 1;
        if matches!(mode, AlgorithmMode::Visualization) {
            events.push(AlgorithmEvent {
                timestamp: 0.0,
                category: EventCategory::Comparison,
                event: "compare".to_string(),
                indices: Some(vec![j, high]),
                values: Some(vec![serde_json::json!(data[j]), serde_json::json!(pivot)]),
                metadata: None,
            });
        }
        
        if data[j] < pivot {
            if i != j {
                data.swap(i, j);
                *swaps += 1;
                if matches!(mode, AlgorithmMode::Visualization) {
                    events.push(AlgorithmEvent {
                        timestamp: 0.0,
                        category: EventCategory::ArrayMutation,
                        event: "swap".to_string(),
                        indices: Some(vec![i, j]),
                        values: Some(vec![serde_json::json!(data[i]), serde_json::json!(data[j])]),
                        metadata: None,
                    });
                }
            }
            i += 1;
        }
    }
    
    if i != high {
        data.swap(i, high);
        *swaps += 1;
        if matches!(mode, AlgorithmMode::Visualization) {
            events.push(AlgorithmEvent {
                timestamp: 0.0,
                category: EventCategory::ArrayMutation,
                event: "swap".to_string(),
                indices: Some(vec![i, high]),
                values: Some(vec![serde_json::json!(data[i]), serde_json::json!(data[high])]),
                metadata: None,
            });
        }
    }
    
    i
}

fn quick_sort(data: &mut Vec<i32>, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    if !data.is_empty() {
        let n = data.len();
        quick_sort_helper(data, 0, n - 1, mode, events, comps, swaps);
    }
}

fn merge_sort(data: &mut Vec<i32>, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    if data.is_empty() { return; }
    let n = data.len();
    merge_sort_helper(data, 0, n - 1, mode, events, comps, swaps);
}

fn merge_sort_helper(data: &mut Vec<i32>, left: usize, right: usize, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    if left < right {
        let mid = left + (right - left) / 2;
        merge_sort_helper(data, left, mid, mode, events, comps, swaps);
        merge_sort_helper(data, mid + 1, right, mode, events, comps, swaps);
        merge(data, left, mid, right, mode, events, comps, swaps);
    }
}

fn merge(data: &mut Vec<i32>, left: usize, mid: usize, right: usize, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    let mut temp = Vec::with_capacity(right - left + 1);
    let mut i = left;
    let mut j = mid + 1;

    while i <= mid && j <= right {
        *comps += 1;
        if matches!(mode, AlgorithmMode::Visualization) {
            events.push(AlgorithmEvent {
                timestamp: 0.0,
                category: EventCategory::Comparison,
                event: "compare".to_string(),
                indices: Some(vec![i, j]),
                values: Some(vec![serde_json::json!(data[i]), serde_json::json!(data[j])]),
                metadata: None,
            });
        }
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
        let idx = left + k;
        data[idx] = val;
        *swaps += 1; // treating write as swap for metric parity with other languages
        if matches!(mode, AlgorithmMode::Visualization) {
            events.push(AlgorithmEvent {
                timestamp: 0.0,
                category: EventCategory::ArrayMutation,
                event: "overwrite".to_string(),
                indices: Some(vec![idx]),
                values: Some(vec![serde_json::json!(val)]),
                metadata: None,
            });
        }
    }
}

fn insertion_sort(data: &mut Vec<i32>, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    let n = data.len();
    for i in 1..n {
        let key = data[i];
        let mut j = i;
        
        while j > 0 {
            *comps += 1;
            if matches!(mode, AlgorithmMode::Visualization) {
                events.push(AlgorithmEvent {
                    timestamp: 0.0,
                    category: EventCategory::Comparison,
                    event: "compare".to_string(),
                    indices: Some(vec![j - 1, i]),
                    values: Some(vec![serde_json::json!(data[j - 1]), serde_json::json!(key)]),
                    metadata: None,
                });
            }
            if data[j - 1] > key {
                data[j] = data[j - 1];
                *swaps += 1;
                if matches!(mode, AlgorithmMode::Visualization) {
                    events.push(AlgorithmEvent {
                        timestamp: 0.0,
                        category: EventCategory::ArrayMutation,
                        event: "overwrite".to_string(),
                        indices: Some(vec![j]),
                        values: Some(vec![serde_json::json!(data[j])]),
                        metadata: None,
                    });
                }
                j -= 1;
            } else {
                break;
            }
        }
        data[j] = key;
        *swaps += 1;
        if matches!(mode, AlgorithmMode::Visualization) {
            events.push(AlgorithmEvent {
                timestamp: 0.0,
                category: EventCategory::ArrayMutation,
                event: "overwrite".to_string(),
                indices: Some(vec![j]),
                values: Some(vec![serde_json::json!(data[j])]),
                metadata: None,
            });
        }
    }
}

fn selection_sort(data: &mut Vec<i32>, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    let n = data.len();
    for i in 0..n {
        let mut min_idx = i;
        for j in (i + 1)..n {
            *comps += 1;
            if matches!(mode, AlgorithmMode::Visualization) {
                events.push(AlgorithmEvent {
                    timestamp: 0.0,
                    category: EventCategory::Comparison,
                    event: "compare".to_string(),
                    indices: Some(vec![j, min_idx]),
                    values: Some(vec![serde_json::json!(data[j]), serde_json::json!(data[min_idx])]),
                    metadata: None,
                });
            }
            if data[j] < data[min_idx] {
                min_idx = j;
            }
        }
        if min_idx != i {
            data.swap(i, min_idx);
            *swaps += 1;
            if matches!(mode, AlgorithmMode::Visualization) {
                events.push(AlgorithmEvent {
                    timestamp: 0.0,
                    category: EventCategory::ArrayMutation,
                    event: "swap".to_string(),
                    indices: Some(vec![i, min_idx]),
                    values: Some(vec![serde_json::json!(data[i]), serde_json::json!(data[min_idx])]),
                    metadata: None,
                });
            }
        }
    }
}

fn heap_sort(data: &mut Vec<i32>, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    if data.is_empty() { return; }
    let n = data.len();

    // Build max heap
    for i in (0..n / 2).rev() {
        heapify(data, n, i, mode, events, comps, swaps);
    }

    // Extract elements from heap one by one
    for i in (1..n).rev() {
        data.swap(0, i);
        *swaps += 1;
        if matches!(mode, AlgorithmMode::Visualization) {
            events.push(AlgorithmEvent {
                timestamp: 0.0,
                category: EventCategory::ArrayMutation,
                event: "swap".to_string(),
                indices: Some(vec![0, i]),
                values: Some(vec![serde_json::json!(data[0]), serde_json::json!(data[i])]),
                metadata: None,
            });
        }
        heapify(data, i, 0, mode, events, comps, swaps);
    }
}

fn heapify(data: &mut Vec<i32>, n: usize, i: usize, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    let mut largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    if left < n {
        *comps += 1;
        if matches!(mode, AlgorithmMode::Visualization) {
            events.push(AlgorithmEvent {
                timestamp: 0.0,
                category: EventCategory::Comparison,
                event: "compare".to_string(),
                indices: Some(vec![left, largest]),
                values: Some(vec![serde_json::json!(data[left]), serde_json::json!(data[largest])]),
                metadata: None,
            });
        }
        if data[left] > data[largest] {
            largest = left;
        }
    }

    if right < n {
        *comps += 1;
        if matches!(mode, AlgorithmMode::Visualization) {
            events.push(AlgorithmEvent {
                timestamp: 0.0,
                category: EventCategory::Comparison,
                event: "compare".to_string(),
                indices: Some(vec![right, largest]),
                values: Some(vec![serde_json::json!(data[right]), serde_json::json!(data[largest])]),
                metadata: None,
            });
        }
        if data[right] > data[largest] {
            largest = right;
        }
    }

    if largest != i {
        data.swap(i, largest);
        *swaps += 1;
        if matches!(mode, AlgorithmMode::Visualization) {
            events.push(AlgorithmEvent {
                timestamp: 0.0,
                category: EventCategory::ArrayMutation,
                event: "swap".to_string(),
                indices: Some(vec![i, largest]),
                values: Some(vec![serde_json::json!(data[i]), serde_json::json!(data[largest])]),
                metadata: None,
            });
        }
        heapify(data, n, largest, mode, events, comps, swaps);
    }
}

fn shell_sort(data: &mut Vec<i32>, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    let n = data.len();
    let mut gap = n / 2;

    while gap > 0 {
        for i in gap..n {
            let temp = data[i];
            let mut j = i;

            while j >= gap {
                *comps += 1;
                if matches!(mode, AlgorithmMode::Visualization) {
                    events.push(AlgorithmEvent {
                        timestamp: 0.0,
                        category: EventCategory::Comparison,
                        event: "compare".to_string(),
                        indices: Some(vec![j - gap, i]),
                        values: Some(vec![serde_json::json!(data[j - gap]), serde_json::json!(temp)]),
                        metadata: None,
                    });
                }
                if data[j - gap] > temp {
                    data[j] = data[j - gap];
                    *swaps += 1;
                    if matches!(mode, AlgorithmMode::Visualization) {
                        events.push(AlgorithmEvent {
                            timestamp: 0.0,
                            category: EventCategory::ArrayMutation,
                            event: "overwrite".to_string(),
                            indices: Some(vec![j]),
                            values: Some(vec![serde_json::json!(data[j])]),
                            metadata: None,
                        });
                    }
                    j -= gap;
                } else {
                    break;
                }
            }
            data[j] = temp;
            *swaps += 1;
            if matches!(mode, AlgorithmMode::Visualization) {
                events.push(AlgorithmEvent {
                    timestamp: 0.0,
                    category: EventCategory::ArrayMutation,
                    event: "overwrite".to_string(),
                    indices: Some(vec![j]),
                    values: Some(vec![serde_json::json!(data[j])]),
                    metadata: None,
                });
            }
        }
        gap /= 2;
    }
}

pub fn run_sort(algo: &str, mut data: Vec<i32>, mode: &AlgorithmMode) -> VersionedAlgorithmContract {
    let mut events = Vec::new();
    let mut comparisons = 0;
    let mut swaps = 0;
    
    let start = Instant::now();
    
    match algo {
        "bubble_sort" => bubble_sort(&mut data, mode, &mut events, &mut comparisons, &mut swaps),
        "quick_sort" => quick_sort(&mut data, mode, &mut events, &mut comparisons, &mut swaps),
        "merge_sort" => merge_sort(&mut data, mode, &mut events, &mut comparisons, &mut swaps),
        "insertion_sort" => insertion_sort(&mut data, mode, &mut events, &mut comparisons, &mut swaps),
        "selection_sort" => selection_sort(&mut data, mode, &mut events, &mut comparisons, &mut swaps),
        "heap_sort" => heap_sort(&mut data, mode, &mut events, &mut comparisons, &mut swaps),
        "shell_sort" => shell_sort(&mut data, mode, &mut events, &mut comparisons, &mut swaps),
        _ => {
            // Fallback default sort
            data.sort();
        }
    }
    
    let duration = start.elapsed();
    let time_ms = duration.as_secs_f64() * 1000.0;
    
    let final_state = match mode {
        AlgorithmMode::Visualization => Some(data.iter().map(|&v| serde_json::Value::Number(v.into())).collect()),
        AlgorithmMode::Benchmark => None,
    };
    
    VersionedAlgorithmContract {
        version: "1.0".to_string(),
        algorithm: algo.to_string(),
        language: "rust".to_string(),
        mode: mode.clone(),
        visualization_level: None,
        events,
        metrics: AlgorithmMetrics {
            comparisons: Some(comparisons),
            swaps: Some(swaps),
            time_ms,
            allocations: None,
            memory_used_kb: None,
        },
        complexity: get_complexity(algo),
        final_state,
    }
}

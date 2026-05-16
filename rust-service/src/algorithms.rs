use crate::contracts::*;
use std::time::{Instant, SystemTime, UNIX_EPOCH};

fn get_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

fn push_event(
    events: &mut Vec<AlgorithmEvent>,
    category: EventCategory,
    event: &str,
    indices: Option<Vec<usize>>,
    values: Option<Vec<i32>>,
    description: &str,
    metadata: Option<serde_json::Value>,
) {
    events.push(AlgorithmEvent {
        timestamp: get_timestamp(),
        category,
        event: event.to_string(),
        indices,
        values,
        description: Some(description.to_string()),
        metadata,
    });
}

fn line_meta(line: u32) -> Option<serde_json::Value> {
    Some(serde_json::json!({ "line_number": line }))
}

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
    if matches!(mode, AlgorithmMode::Visualization) {
        push_event(events, EventCategory::Initial, "initial", None, Some(data.clone()), "Initial state", None);
    }

    for i in 0..n {
        for j in 0..n.saturating_sub(i).saturating_sub(1) {
            *comps += 1;
            if matches!(mode, AlgorithmMode::Visualization) {
                push_event(
                    events,
                    EventCategory::Comparison,
                    "compare",
                    Some(vec![j, j + 1]),
                    Some(vec![data[j], data[j + 1]]),
                    &format!("Comparing {} and {}", data[j], data[j + 1]),
                    line_meta(5),
                );
            }
            if data[j] > data[j + 1] {
                data.swap(j, j + 1);
                *swaps += 1;
                if matches!(mode, AlgorithmMode::Visualization) {
                    push_event(
                        events,
                        EventCategory::ArrayMutation,
                        "swap",
                        Some(vec![j, j + 1]),
                        Some(vec![data[j], data[j + 1]]),
                        &format!("Swapping {} and {}", data[j], data[j + 1]),
                        line_meta(6),
                    );
                }
            }
        }
    }

    if matches!(mode, AlgorithmMode::Visualization) {
        push_event(events, EventCategory::Final, "final", None, Some(data.clone()), "Sorted state", None);
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
            push_event(
                events,
                EventCategory::Comparison,
                "compare",
                Some(vec![j, high]),
                Some(vec![data[j], pivot]),
                &format!("Comparing {} with pivot {}", data[j], pivot),
                line_meta(5),
            );
        }
        
        if data[j] < pivot {
            if i != j {
                data.swap(i, j);
                *swaps += 1;
                if matches!(mode, AlgorithmMode::Visualization) {
                    push_event(
                        events,
                        EventCategory::ArrayMutation,
                        "swap",
                        Some(vec![i, j]),
                        Some(vec![data[i], data[j]]),
                        &format!("Swapping {} and {}", data[i], data[j]),
                        line_meta(6),
                    );
                }
            }
            i += 1;
        }
    }
    
    if i != high {
        data.swap(i, high);
        *swaps += 1;
        if matches!(mode, AlgorithmMode::Visualization) {
            push_event(
                events,
                EventCategory::ArrayMutation,
                "swap_pivot",
                Some(vec![i, high]),
                Some(vec![data[i], data[high]]),
                &format!("Placing pivot {} at correct position", data[i]),
                line_meta(10),
            );
        }
    }
    
    i
}

fn quick_sort(data: &mut Vec<i32>, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    if !data.is_empty() {
        if matches!(mode, AlgorithmMode::Visualization) {
            push_event(events, EventCategory::Initial, "initial", None, Some(data.clone()), "Initial state", None);
        }
        let n = data.len();
        quick_sort_helper(data, 0, n - 1, mode, events, comps, swaps);
        if matches!(mode, AlgorithmMode::Visualization) {
            push_event(events, EventCategory::Final, "final", None, Some(data.clone()), "Sorted state", None);
        }
    }
}

fn merge_sort(data: &mut Vec<i32>, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    if data.is_empty() { return; }
    if matches!(mode, AlgorithmMode::Visualization) {
        push_event(events, EventCategory::Initial, "initial", None, Some(data.clone()), "Initial state", None);
    }
    let n = data.len();
    merge_sort_helper(data, 0, n - 1, mode, events, comps, swaps);
    if matches!(mode, AlgorithmMode::Visualization) {
        push_event(events, EventCategory::Final, "final", None, Some(data.clone()), "Sorted state", None);
    }
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
            push_event(
                events,
                EventCategory::Comparison,
                "compare",
                Some(vec![i, j]),
                Some(vec![data[i], data[j]]),
                &format!("Comparing {} and {}", data[i], data[j]),
                line_meta(7),
            );
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
            push_event(
                events,
                EventCategory::ArrayMutation,
                "overwrite",
                Some(vec![idx]),
                Some(vec![val]),
                &format!("Merging value {} back to array", val),
                line_meta(27),
            );
        }
    }
}

fn insertion_sort(data: &mut Vec<i32>, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    if matches!(mode, AlgorithmMode::Visualization) {
        push_event(events, EventCategory::Initial, "initial", None, Some(data.clone()), "Initial state", None);
    }
    let n = data.len();
    for i in 1..n {
        let key = data[i];
        let mut j = i;
        
        while j > 0 {
            *comps += 1;
            if matches!(mode, AlgorithmMode::Visualization) {
                push_event(
                    events,
                    EventCategory::Comparison,
                    "compare",
                    Some(vec![j - 1, i]),
                    Some(vec![data[j - 1], key]),
                    &format!("Comparing {} with key {}", data[j - 1], key),
                    line_meta(7),
                );
            }
            if data[j - 1] > key {
                data[j] = data[j - 1];
                *swaps += 1;
                if matches!(mode, AlgorithmMode::Visualization) {
                    push_event(
                        events,
                        EventCategory::ArrayMutation,
                        "shift",
                        Some(vec![j]),
                        Some(vec![data[j]]),
                        &format!("Shifting {} to the right", data[j]),
                        line_meta(8),
                    );
                }
                j -= 1;
            } else {
                break;
            }
        }
        data[j] = key;
        *swaps += 1;
        if matches!(mode, AlgorithmMode::Visualization) {
            push_event(
                events,
                EventCategory::ArrayMutation,
                "insert",
                Some(vec![j]),
                Some(vec![data[j]]),
                &format!("Inserting key {} at position {}", key, j),
                line_meta(11),
            );
        }
    }
    if matches!(mode, AlgorithmMode::Visualization) {
        push_event(events, EventCategory::Final, "final", None, Some(data.clone()), "Sorted state", None);
    }
}

fn selection_sort(data: &mut Vec<i32>, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    if matches!(mode, AlgorithmMode::Visualization) {
        push_event(events, EventCategory::Initial, "initial", None, Some(data.clone()), "Initial state", None);
    }
    let n = data.len();
    for i in 0..n {
        let mut min_idx = i;
        for j in (i + 1)..n {
            *comps += 1;
            if matches!(mode, AlgorithmMode::Visualization) {
                push_event(
                    events,
                    EventCategory::Comparison,
                    "compare",
                    Some(vec![j, min_idx]),
                    Some(vec![data[j], data[min_idx]]),
                    &format!("Comparing {} with current min {}", data[j], data[min_idx]),
                    line_meta(6),
                );
            }
            if data[j] < data[min_idx] {
                min_idx = j;
            }
        }
        if min_idx != i {
            data.swap(i, min_idx);
            *swaps += 1;
            if matches!(mode, AlgorithmMode::Visualization) {
                push_event(
                    events,
                    EventCategory::ArrayMutation,
                    "swap",
                    Some(vec![i, min_idx]),
                    Some(vec![data[i], data[min_idx]]),
                    &format!("Swapping {} with new minimum {}", data[i], data[min_idx]),
                    line_meta(11),
                );
            }
        }
    }
    if matches!(mode, AlgorithmMode::Visualization) {
        push_event(events, EventCategory::Final, "final", None, Some(data.clone()), "Sorted state", None);
    }
}

fn heap_sort(data: &mut Vec<i32>, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    if data.is_empty() { return; }
    if matches!(mode, AlgorithmMode::Visualization) {
        push_event(events, EventCategory::Initial, "initial", None, Some(data.clone()), "Initial state", None);
    }
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
            push_event(
                events,
                EventCategory::ArrayMutation,
                "swap",
                Some(vec![0, i]),
                Some(vec![data[0], data[i]]),
                &format!("Moving root {} to end of heap", data[i]),
                line_meta(29),
            );
        }
        heapify(data, i, 0, mode, events, comps, swaps);
    }
    if matches!(mode, AlgorithmMode::Visualization) {
        push_event(events, EventCategory::Final, "final", None, Some(data.clone()), "Sorted state", None);
    }
}

fn heapify(data: &mut Vec<i32>, n: usize, i: usize, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    let mut largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    if left < n {
        *comps += 1;
        if matches!(mode, AlgorithmMode::Visualization) {
            push_event(
                events,
                EventCategory::Comparison,
                "compare",
                Some(vec![left, largest]),
                Some(vec![data[left], data[largest]]),
                &format!("Comparing child {} with parent {}", data[left], data[largest]),
                line_meta(6),
            );
        }
        if data[left] > data[largest] {
            largest = left;
        }
    }

    if right < n {
        *comps += 1;
        if matches!(mode, AlgorithmMode::Visualization) {
            push_event(
                events,
                EventCategory::Comparison,
                "compare",
                Some(vec![right, largest]),
                Some(vec![data[right], data[largest]]),
                &format!("Comparing child {} with parent {}", data[right], data[largest]),
                line_meta(10),
            );
        }
        if data[right] > data[largest] {
            largest = right;
        }
    }

    if largest != i {
        data.swap(i, largest);
        *swaps += 1;
        if matches!(mode, AlgorithmMode::Visualization) {
            push_event(
                events,
                EventCategory::ArrayMutation,
                "swap",
                Some(vec![i, largest]),
                Some(vec![data[i], data[largest]]),
                &format!("Swapping parent {} with child {}", data[largest], data[i]),
                line_meta(15),
            );
        }
        heapify(data, n, largest, mode, events, comps, swaps);
    }
}

fn shell_sort(data: &mut Vec<i32>, mode: &AlgorithmMode, events: &mut Vec<AlgorithmEvent>, comps: &mut u64, swaps: &mut u64) {
    if matches!(mode, AlgorithmMode::Visualization) {
        push_event(events, EventCategory::Initial, "initial", None, Some(data.clone()), "Initial state", None);
    }
    let n = data.len();
    let mut gap = n / 2;

    while gap > 0 {
        for i in gap..n {
            let temp = data[i];
            let mut j = i;

            while j >= gap {
                *comps += 1;
                if matches!(mode, AlgorithmMode::Visualization) {
                    push_event(
                        events,
                        EventCategory::Comparison,
                        "compare",
                        Some(vec![j - gap, i]),
                        Some(vec![data[j - gap], temp]),
                        &format!("Comparing elements at indices {} and {} with gap {}", j - gap, i, gap),
                        line_meta(10),
                    );
                }
                if data[j - gap] > temp {
                    data[j] = data[j - gap];
                    *swaps += 1;
                    if matches!(mode, AlgorithmMode::Visualization) {
                        push_event(
                            events,
                            EventCategory::ArrayMutation,
                            "shift",
                            Some(vec![j]),
                            Some(vec![data[j]]),
                            &format!("Shifting element {} forward", data[j]),
                            line_meta(11),
                        );
                    }
                    j -= gap;
                } else {
                    break;
                }
            }
            data[j] = temp;
            *swaps += 1;
            if matches!(mode, AlgorithmMode::Visualization) {
                push_event(
                    events,
                    EventCategory::ArrayMutation,
                    "insert",
                    Some(vec![j]),
                    Some(vec![data[j]]),
                    &format!("Inserting {} at correct gap position", data[j]),
                    line_meta(14),
                );
            }
        }
        gap /= 2;
    }
    if matches!(mode, AlgorithmMode::Visualization) {
        push_event(events, EventCategory::Final, "final", None, Some(data.clone()), "Sorted state", None);
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

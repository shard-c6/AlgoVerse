
import sqlite3
import json

def check_db():
    conn = sqlite3.connect('backend/algoverse.db')
    cursor = conn.cursor()
    
    print("--- Algorithms ---")
    cursor.execute("SELECT id, name, complexity_class FROM algorithms")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- Latest 10 Benchmark Runs ---")
    cursor.execute("""
        SELECT br.id, a.name, br.language, br.input_size, br.execution_time_ms, br.run_date 
        FROM benchmark_runs br
        JOIN algorithms a ON br.algorithm_id = a.id
        ORDER BY br.id DESC
        LIMIT 10
    """)
    for row in cursor.fetchall():
        print(row)
        
    conn.close()

if __name__ == "__main__":
    check_db()

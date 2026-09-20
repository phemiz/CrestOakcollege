<?php
// Shared, atomic, sequential matric number generator.
// Format: CCHSMT/<year>/0001 (per-year sequence, no dept code, no random numbers).
function get_next_matric_number(mysqli $conn, ?int $year = null): string {
    $year = $year ?? (int)date('Y');
    $conn->begin_transaction();
    try {
        $conn->query(
            "CREATE TABLE IF NOT EXISTS matric_counters (
                year INT PRIMARY KEY,
                last_number INT NOT NULL DEFAULT 0
            )"
        );
        $conn->query("INSERT IGNORE INTO matric_counters (year, last_number) VALUES ($year, 0)");
        $conn->query("SELECT last_number FROM matric_counters WHERE year = $year FOR UPDATE");
        $res = $conn->query("SELECT last_number FROM matric_counters WHERE year = $year");
        $row = $res->fetch_assoc();
        $next = (int)$row['last_number'] + 1;
        $conn->query("UPDATE matric_counters SET last_number = $next WHERE year = $year");
        $conn->commit();
    } catch (Throwable $e) {
        $conn->rollback();
        error_log('get_next_matric_number failed: ' . $e->getMessage());
        throw $e;
    }
    return "CCHSMT/{$year}/" . str_pad((string)$next, 4, '0', STR_PAD_LEFT);
}

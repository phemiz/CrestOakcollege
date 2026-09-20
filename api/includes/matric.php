<?php
// Shared matric-number logic.
// Format: CCHSMT/<DEPT>/<year>/0001 — sequence resets per department, per year.

function get_dept_code(string $raw): string {
    $raw = strtolower($raw);
    $map = [
        'nursing' => 'NUR',
        'medical laboratory' => 'MLS',
        'community health' => 'CHEW',
        'business' => 'BUS',
        'computer' => 'CSC',
    ];
    foreach ($map as $needle => $code) {
        if (str_contains($raw, $needle)) {
            return $code;
        }
    }
    return 'GEN';
}

function get_next_matric_number(mysqli $conn, string $deptCode, ?int $year = null): string {
    $year = $year ?? (int)date('Y');
    $conn->begin_transaction();
    try {
        $conn->query(
            "CREATE TABLE IF NOT EXISTS matric_counters (
                year INT NOT NULL,
                dept_code VARCHAR(10) NOT NULL,
                last_number INT NOT NULL DEFAULT 0,
                PRIMARY KEY (year, dept_code)
            )"
        );
        $deptEsc = $conn->real_escape_string($deptCode);
        $conn->query("INSERT IGNORE INTO matric_counters (year, dept_code, last_number) VALUES ($year, '$deptEsc', 0)");
        $conn->query("SELECT last_number FROM matric_counters WHERE year = $year AND dept_code = '$deptEsc' FOR UPDATE");
        $res = $conn->query("SELECT last_number FROM matric_counters WHERE year = $year AND dept_code = '$deptEsc'");
        $row = $res->fetch_assoc();
        $next = (int)$row['last_number'] + 1;
        $conn->query("UPDATE matric_counters SET last_number = $next WHERE year = $year AND dept_code = '$deptEsc'");
        $conn->commit();
    } catch (Throwable $e) {
        $conn->rollback();
        error_log('get_next_matric_number failed: ' . $e->getMessage());
        throw $e;
    }
    return "CCHSMT/{$deptCode}/{$year}/" . str_pad((string)$next, 4, '0', STR_PAD_LEFT);
}

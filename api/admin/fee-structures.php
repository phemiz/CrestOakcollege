<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'BURSARY', 'BURSAR']);

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDbConnection();

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

if ($method === 'GET') {
    $where = [];
    $params = [];
    $types = "";

    if (!empty($_GET['session'])) {
        $where[] = "session = ?";
        $params[] = $_GET['session'];
        $types .= "s";
    }
    if (!empty($_GET['department'])) {
        $where[] = "(department = ? OR department IS NULL)";
        $params[] = $_GET['department'];
        $types .= "s";
    }
    if (!empty($_GET['level'])) {
        $where[] = "(level = ? OR level IS NULL)";
        $params[] = $_GET['level'];
        $types .= "s";
    }
    if (!empty($_GET['fee_type'])) {
        $where[] = "fee_type = ?";
        $params[] = $_GET['fee_type'];
        $types .= "s";
    }
    if (isset($_GET['is_active'])) {
        $where[] = "is_active = ?";
        $params[] = (int)$_GET['is_active'];
        $types .= "i";
    }

    $sql = "SELECT * FROM fee_structures";
    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY session DESC, department ASC, level ASC, fee_type ASC";

    $structures = [];
    if (!empty($params)) {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $res = $stmt->get_result();
    } else {
        $res = $conn->query($sql);
    }

    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $structures[] = [
                "id" => (int)$row['id'],
                "department" => $row['department'],
                "level" => $row['level'],
                "session" => $row['session'],
                "feeType" => $row['fee_type'],
                "description" => $row['description'],
                "amount" => (float)$row['amount'],
                "isMandatory" => (bool)$row['is_mandatory'],
                "allowInstallment" => (bool)$row['allow_installment'],
                "minInstallmentAmount" => $row['min_installment_amount'] !== null ? (float)$row['min_installment_amount'] : null,
                "isActive" => (bool)$row['is_active'],
                "createdAt" => $row['created_at'],
                "updatedAt" => $row['updated_at']
            ];
        }
    }

    echo json_encode(["success" => true, "feeStructures" => $structures], JSON_UNESCAPED_SLASHES);
    $conn->close();
    exit();
}

if ($method === 'POST') {
    validate_csrf();
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST ?? [];

    $department = !empty($input['department']) ? $input['department'] : null;
    $level = !empty($input['level']) ? $input['level'] : null;
    $sessionYear = trim($input['session'] ?? '');
    $feeType = trim($input['feeType'] ?? '');
    $description = $input['description'] ?? null;
    $amount = (float)($input['amount'] ?? 0);
    $isMandatory = !empty($input['isMandatory']) ? 1 : 0;
    $allowInstallment = !empty($input['allowInstallment']) ? 1 : 0;
    $minInstallmentAmount = isset($input['minInstallmentAmount']) && $input['minInstallmentAmount'] !== '' ? (float)$input['minInstallmentAmount'] : null;

    if ($sessionYear === '' || $feeType === '' || $amount <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "session, feeType, and a positive amount are required."]);
        $conn->close();
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO fee_structures (department, level, session, fee_type, description, amount, is_mandatory, allow_installment, min_installment_amount, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
    $stmt->bind_param("sssssdiid", $department, $level, $sessionYear, $feeType, $description, $amount, $isMandatory, $allowInstallment, $minInstallmentAmount);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Fee structure created.", "id" => $stmt->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to create fee structure: " . $conn->error]);
    }
    $stmt->close();
    $conn->close();
    exit();
}

if ($method === 'PUT') {
    validate_csrf();
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($input['id'] ?? 0);

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid id is required."]);
        $conn->close();
        exit();
    }

    $fields = [];
    $params = [];
    $types = "";

    $map = [
        'department' => 's', 'level' => 's', 'session' => 's', 'feeType' => 's',
        'description' => 's', 'amount' => 'd', 'isMandatory' => 'i',
        'allowInstallment' => 'i', 'minInstallmentAmount' => 'd', 'isActive' => 'i'
    ];
    $columnMap = [
        'department' => 'department', 'level' => 'level', 'session' => 'session', 'feeType' => 'fee_type',
        'description' => 'description', 'amount' => 'amount', 'isMandatory' => 'is_mandatory',
        'allowInstallment' => 'allow_installment', 'minInstallmentAmount' => 'min_installment_amount', 'isActive' => 'is_active'
    ];

    foreach ($map as $key => $type) {
        if (array_key_exists($key, $input)) {
            $fields[] = $columnMap[$key] . " = ?";
            $value = $input[$key];
            if ($key === 'department' || $key === 'level') {
                $value = ($value === '' || $value === null) ? null : $value;
            }
            if (in_array($key, ['isMandatory', 'allowInstallment', 'isActive'])) {
                $value = !empty($value) ? 1 : 0;
            }
            $params[] = $value;
            $types .= $type;
        }
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No fields provided to update."]);
        $conn->close();
        exit();
    }

    $params[] = $id;
    $types .= "i";

    $sql = "UPDATE fee_structures SET " . implode(", ", $fields) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Fee structure updated."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update fee structure: " . $conn->error]);
    }
    $stmt->close();
    $conn->close();
    exit();
}

if ($method === 'DELETE') {
    validate_csrf();
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($input['id'] ?? ($_GET['id'] ?? 0));

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid id is required."]);
        $conn->close();
        exit();
    }

    $stmt = $conn->prepare("UPDATE fee_structures SET is_active = 0 WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Fee structure deactivated."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to deactivate fee structure: " . $conn->error]);
    }
    $stmt->close();
    $conn->close();
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Invalid request method."]);
exit();
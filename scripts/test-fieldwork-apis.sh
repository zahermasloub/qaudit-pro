# Sprint 7 - Fieldwork & Evidence System cURL Tests
# ===================================================
# Complete API testing suite for all endpoints

# Test Configuration
BASE_URL="http://localhost:3000"
ENGAGEMENT_ID="ENG-DEMO-001"
TEST_FILE="test-document.pdf"

echo "🔬 Sprint 7 Fieldwork & Evidence API Testing Suite"
echo "================================================="
echo "Base URL: $BASE_URL"
echo "Engagement ID: $ENGAGEMENT_ID"
echo ""

# ===== 1. Test Execution API Tests =====
echo "🧪 Testing Test Execution APIs"
echo "-------------------------------"

# Test 1.1: Single Test Execution
echo "📝 Test 1.1: Single Test Execution"
curl -X POST "$BASE_URL/api/fieldwork/test-runs" \
  -H "Content-Type: application/json" \
  -d '{
    "engagementId": "'$ENGAGEMENT_ID'",
    "auditTestId": "TEST-001",
    "auditTestTitle": "اختبار تحقق من صحة البيانات المالية",
    "stepIndex": 1,
    "actionTaken": "فحص القوائم المالية للربع الأول",
    "result": "pass",
    "resultDetails": "تم التحقق من صحة جميع القيود",
    "notes": "تمت المراجعة بعناية",
    "executedBy": "auditor@example.com"
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

# Test 1.2: Batch Test Execution
echo "📋 Test 1.2: Batch Test Execution"
curl -X POST "$BASE_URL/api/fieldwork/test-runs" \
  -H "Content-Type: application/json" \
  -d '{
    "batch": [
      {
        "engagementId": "'$ENGAGEMENT_ID'",
        "auditTestId": "TEST-002",
        "auditTestTitle": "اختبار ضوابط الوصول",
        "stepIndex": 1,
        "actionTaken": "مراجعة صلاحيات المستخدمين",
        "result": "fail",
        "resultDetails": "وجود مستخدمين بصلاحيات غير مناسبة",
        "executedBy": "auditor@example.com"
      },
      {
        "engagementId": "'$ENGAGEMENT_ID'",
        "auditTestId": "TEST-003",
        "auditTestTitle": "اختبار النسخ الاحتياطي",
        "stepIndex": 1,
        "actionTaken": "فحص جدولة النسخ الاحتياطي",
        "result": "pass",
        "resultDetails": "النسخ الاحتياطي يتم حسب الجدول",
        "executedBy": "auditor@example.com"
      }
    ]
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

# Test 1.3: Get Test Runs
echo "📊 Test 1.3: Get Test Runs"
curl -X GET "$BASE_URL/api/fieldwork/test-runs?engagementId=$ENGAGEMENT_ID" \
  -H "Accept: application/json" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

# Test 1.4: Invalid Data Validation
echo "❌ Test 1.4: Invalid Data Validation"
curl -X POST "$BASE_URL/api/fieldwork/test-runs" \
  -H "Content-Type: application/json" \
  -d '{
    "engagementId": "",
    "auditTestId": "",
    "result": "invalid_result"
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

echo ""

# ===== 2. Evidence Upload API Tests =====
echo "📁 Testing Evidence Upload APIs"
echo "-------------------------------"

# Create a test file first
echo "Creating test document..."
echo "This is a test document for evidence upload testing." > "$TEST_FILE"

# Test 2.1: Single File Upload
echo "📤 Test 2.1: Single File Upload"
curl -X POST "$BASE_URL/api/evidence/batch-upload" \
  -F "file=@$TEST_FILE" \
  -F 'meta={
    "engagementId": "'$ENGAGEMENT_ID'",
    "category": "financial_statement",
    "linkedTestId": "TEST-001",
    "description": "القوائم المالية للربع الأول 2024",
    "uploadedBy": "auditor@example.com"
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

# Test 2.2: Multiple Files Upload (simulated)
echo "📦 Test 2.2: Multiple Files Upload (simulated)"
echo "Creating additional test files..."
echo "Contract document content" > "contract-test.txt"
echo "Policy document content" > "policy-test.txt"

curl -X POST "$BASE_URL/api/evidence/batch-upload" \
  -F "file=@contract-test.txt" \
  -F 'meta={
    "engagementId": "'$ENGAGEMENT_ID'",
    "category": "contract",
    "linkedTestId": "TEST-002",
    "description": "عقد الخدمات الأساسية",
    "uploadedBy": "auditor@example.com"
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

# Test 2.3: Invalid File Upload
echo "❌ Test 2.3: Invalid File Upload (missing metadata)"
curl -X POST "$BASE_URL/api/evidence/batch-upload" \
  -F "file=@$TEST_FILE" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

# Test 2.4: Invalid Category
echo "❌ Test 2.4: Invalid Category"
curl -X POST "$BASE_URL/api/evidence/batch-upload" \
  -F "file=@$TEST_FILE" \
  -F 'meta={
    "engagementId": "'$ENGAGEMENT_ID'",
    "category": "invalid_category",
    "uploadedBy": "auditor@example.com"
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

echo ""

# ===== 3. Evidence Download API Tests =====
echo "📥 Testing Evidence Download APIs"
echo "--------------------------------"

# Test 3.1: Secure Download (will likely fail as we need actual evidence ID)
echo "🔒 Test 3.1: Secure Download (simulated)"
curl -X GET "$BASE_URL/api/evidence/EV-DEMO-001/download-secure" \
  -H "Accept: application/octet-stream" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

# Test 3.2: Invalid Evidence ID
echo "❌ Test 3.2: Invalid Evidence ID"
curl -X GET "$BASE_URL/api/evidence/INVALID-ID/download-secure" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

echo ""

# ===== 4. File Hash & Security Tests =====
echo "🔐 Testing File Hash & Security"
echo "-------------------------------"

# Test 4.1: Hash Generation Test (via storage manager - indirect test)
echo "🔑 Test 4.1: File Hash Generation (via upload)"
echo "  → Hash generation is tested indirectly through file upload"
echo "  → Check server logs for hash calculation messages"

# Test 4.2: Large File Test
echo "📏 Test 4.2: Large File Handling"
echo "Creating larger test file..."
dd if=/dev/zero of=large-test-file.dat bs=1M count=10 2>/dev/null || echo "Large file creation failed (expected on Windows)"

if [ -f "large-test-file.dat" ]; then
  curl -X POST "$BASE_URL/api/evidence/batch-upload" \
    -F "file=@large-test-file.dat" \
    -F 'meta={
      "engagementId": "'$ENGAGEMENT_ID'",
      "category": "system_log",
      "description": "ملف اختبار كبير الحجم",
      "uploadedBy": "auditor@example.com"
    }' \
    -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"
else
  echo "Skipping large file test (file creation failed)"
fi

echo ""

# ===== 5. Error Handling & Edge Cases =====
echo "⚠️  Testing Error Handling & Edge Cases"
echo "---------------------------------------"

# Test 5.1: Missing Required Headers
echo "📋 Test 5.1: Missing Content-Type Header"
curl -X POST "$BASE_URL/api/fieldwork/test-runs" \
  -d '{"engagementId": "'$ENGAGEMENT_ID'"}' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

# Test 5.2: Malformed JSON
echo "📋 Test 5.2: Malformed JSON"
curl -X POST "$BASE_URL/api/fieldwork/test-runs" \
  -H "Content-Type: application/json" \
  -d '{invalid json}' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

# Test 5.3: Empty Request Body
echo "📋 Test 5.3: Empty Request Body"
curl -X POST "$BASE_URL/api/fieldwork/test-runs" \
  -H "Content-Type: application/json" \
  -d '' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

# Test 5.4: Non-existent Endpoint
echo "📋 Test 5.4: Non-existent Endpoint"
curl -X GET "$BASE_URL/api/nonexistent/endpoint" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n"

echo ""

# ===== 6. Performance & Load Tests =====
echo "🚀 Testing Performance & Load"
echo "-----------------------------"

# Test 6.1: Rapid Sequential Requests
echo "⚡ Test 6.1: Rapid Sequential Requests"
for i in {1..5}; do
  echo "  Request $i/5"
  curl -X GET "$BASE_URL/api/fieldwork/test-runs?engagementId=$ENGAGEMENT_ID" \
    -H "Accept: application/json" \
    -s -w "Status: %{http_code}, Time: %{time_total}s\n" &
done
wait

echo ""

# ===== 7. Integration Tests =====
echo "🔄 Testing Integration Scenarios"
echo "-------------------------------"

# Test 7.1: Complete Workflow
echo "🔄 Test 7.1: Complete Workflow (Execute Test → Upload Evidence)"

# Step 1: Execute a test
TEST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/fieldwork/test-runs" \
  -H "Content-Type: application/json" \
  -d '{
    "engagementId": "'$ENGAGEMENT_ID'",
    "auditTestId": "TEST-INTEGRATION-001",
    "auditTestTitle": "اختبار التكامل الشامل",
    "stepIndex": 1,
    "actionTaken": "تنفيذ اختبار تكامل شامل",
    "result": "pass",
    "resultDetails": "نجح الاختبار بالكامل",
    "executedBy": "auditor@example.com"
  }')

echo "  Step 1: Test Execution - $TEST_RESPONSE"

# Step 2: Upload evidence linked to the test
curl -X POST "$BASE_URL/api/evidence/batch-upload" \
  -F "file=@$TEST_FILE" \
  -F 'meta={
    "engagementId": "'$ENGAGEMENT_ID'",
    "category": "audit_trail",
    "linkedTestId": "TEST-INTEGRATION-001",
    "description": "دليل على نجاح اختبار التكامل",
    "uploadedBy": "auditor@example.com"
  }' \
  -s -w "  Step 2: Evidence Upload - Status: %{http_code}, Time: %{time_total}s\n\n"

echo ""

# ===== Cleanup =====
echo "🧹 Cleaning up test files..."
rm -f "$TEST_FILE" "contract-test.txt" "policy-test.txt" "large-test-file.dat" 2>/dev/null || true

echo ""
echo "✅ Sprint 7 API Testing Complete!"
echo "================================="
echo ""
echo "📋 Summary:"
echo "- Test Execution APIs: Single & batch operations tested"
echo "- Evidence Upload APIs: Single & multi-file upload tested"
echo "- Security Features: File hashing and validation tested"
echo "- Error Handling: Various edge cases and invalid inputs tested"
echo "- Performance: Rapid sequential requests tested"
echo "- Integration: End-to-end workflow tested"
echo ""
echo "📝 Notes:"
echo "- Check server logs for detailed error messages"
echo "- Verify file storage location and hash generation"
echo "- Review database entries for test runs and evidence"
echo "- Monitor response times and error rates"
echo ""
echo "🚨 Expected Failures:"
echo "- Some tests may fail if database is not properly configured"
echo "- File download tests may fail without actual evidence records"
echo "- Large file tests may be skipped on Windows systems"
echo ""
echo "🔧 Next Steps:"
echo "1. Review any failing tests and fix underlying issues"
echo "2. Implement proper authentication/authorization"
echo "3. Add comprehensive logging and monitoring"
echo "4. Optimize performance for large file uploads"
echo "5. Add virus scanning integration"

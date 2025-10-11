-- Update existing PBC records to use lowercase status values
-- Run this before applying the new schema

-- Update OPEN to open
UPDATE pbc_requests SET status = 'open' WHERE status = 'OPEN';

-- Update CLOSED to complete (mapping CLOSED to complete)
UPDATE pbc_requests SET status = 'complete' WHERE status = 'CLOSED';

-- Update REVIEWED to complete (mapping REVIEWED to complete)
UPDATE pbc_requests SET status = 'complete' WHERE status = 'REVIEWED';

-- Optional: Check the updated records
-- SELECT status, COUNT(*) FROM pbc_requests GROUP BY status;

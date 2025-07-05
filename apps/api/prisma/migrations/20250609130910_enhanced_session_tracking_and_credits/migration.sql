-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('PURCHASE', 'GRANT', 'USAGE', 'REFUND', 'BONUS');

-- AlterTable
ALTER TABLE "avatar_sessions" ADD COLUMN     "credits_used" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "message_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "session_summary" TEXT,
ADD COLUMN     "session_title" TEXT,
ADD COLUMN     "settings" JSONB;

-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "credits_used" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "processing_time" INTEGER,
ADD COLUMN     "token_count" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "credits_granted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "credits_used" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_active_at" TIMESTAMP(3),
ADD COLUMN     "last_credit_reset" TIMESTAMP(3),
ADD COLUMN     "total_messages_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_session_time" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "transaction_type" "CreditTransactionType" NOT NULL,
    "description" TEXT,
    "session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_statistics" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "messages_count" INTEGER NOT NULL DEFAULT 0,
    "session_count" INTEGER NOT NULL DEFAULT 0,
    "session_time" INTEGER NOT NULL DEFAULT 0,
    "credits_used" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usage_statistics_user_id_date_key" ON "usage_statistics"("user_id", "date");

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_statistics" ADD CONSTRAINT "usage_statistics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

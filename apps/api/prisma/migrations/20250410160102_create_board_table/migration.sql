-- CreateTable
CREATE TABLE "Board" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "columnId" UUID NOT NULL,
    "nextId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Board_nextId_key" ON "Board"("nextId");

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_nextId_fkey" FOREIGN KEY ("nextId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;

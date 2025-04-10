-- CreateTable
CREATE TABLE "Column" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "projectId" UUID NOT NULL,
    "nextId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Column_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Column_nextId_key" ON "Column"("nextId");

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_nextId_fkey" FOREIGN KEY ("nextId") REFERENCES "Column"("id") ON DELETE SET NULL ON UPDATE CASCADE;

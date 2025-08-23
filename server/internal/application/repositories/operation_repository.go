package repositories

import (
	"strings"

	"github.com/beka-birhanu/edit-space/server/internal/domain/entities"
	"github.com/beka-birhanu/edit-space/server/internal/infrastructure/database"

	"github.com/google/uuid"
)

type PgOperationRepository struct {
	db database.Database[entities.Operation]
}

func NewPgOperationRepository(db database.Database[entities.Operation]) *PgOperationRepository {
	return &PgOperationRepository{db: db}
}

func (o *PgOperationRepository) FindOne(clientId uuid.UUID, counter int) (entities.Operation, error) {
	return o.db.FindOne("client_id = ? AND counter = ?", clientId, counter)
}

func (o *PgOperationRepository) FindByClientId(clientId uuid.UUID) ([]entities.Operation, error) {
	return o.db.Find("client_id = ?", clientId)
}

func (o *PgOperationRepository) FindByDocumentId(documentId uuid.UUID) ([]entities.Operation, error) {
	return o.db.Find("document_id = ?", documentId)
}

func (o *PgOperationRepository) Find(documentId uuid.UUID, clientId *uuid.UUID,
	counter *int, operationType *entities.OperationType,
) ([]entities.Operation, error) {
	columns := []string{"document_id = ?"}
	values := []interface{}{documentId}
	if clientId != nil && *clientId != uuid.Nil {
		columns = append(columns, "client_id = ?")
		values = append(values, *clientId)
	}
	if counter != nil {
		columns = append(columns, "counter >= ?")
		values = append(values, *counter)
	}
	if operationType != nil {
		columns = append(columns, "type = ?")
		values = append(values, *operationType)
	}

	fmtdColumns := strings.Join(columns, " AND ")
	return o.db.Find(fmtdColumns, values...)
}

func (o *PgOperationRepository) FindAll() ([]entities.Operation, error) {
	return o.db.FindAll()
}

func (o *PgOperationRepository) Save(operation entities.Operation) error {
	return o.db.Save(operation)
}

func (o *PgOperationRepository) SaveMany(operations []entities.Operation) error {
	return o.db.SaveMany(operations)
}

func (o *PgOperationRepository) Delete(operation entities.Operation) error {
	return o.db.Delete(operation)
}

func (o *PgOperationRepository) DeleteMany(operations []entities.Operation) error {
	return o.db.DeleteMany(operations)
}

func (o *PgOperationRepository) Exists(id uuid.UUID) (bool, error) {
	return o.db.Exists(id)
}

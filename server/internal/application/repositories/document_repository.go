package repositories

import (
	"github.com/beka-birhanu/edit-space/server/internal/domain/entities"
	"github.com/beka-birhanu/edit-space/server/internal/infrastructure/database"

	"github.com/google/uuid"
)

type PgDocumentRepository struct {
	db database.Database[entities.Document]
}

func NewPgDocumentRepository(db database.Database[entities.Document]) *PgDocumentRepository {
	return &PgDocumentRepository{db: db}
}

func (d *PgDocumentRepository) Find(id uuid.UUID) (entities.Document, error) {
	return d.db.FindOne("id = ?", id)
}

func (d *PgDocumentRepository) FindByUserId(userId uuid.UUID) ([]entities.Document, error) {
	return d.db.Find("owner_id = ?", userId)
}

func (d *PgDocumentRepository) FindAll() ([]entities.Document, error) {
	return d.db.FindAll()
}

func (d *PgDocumentRepository) Save(document entities.Document) error {
	return d.db.Save(document)
}

func (d *PgDocumentRepository) Update(document entities.Document) error {
	return d.db.Update(document)
}

func (d *PgDocumentRepository) Delete(entity entities.Document) error {
	return d.db.Delete(entity)
}

func (d *PgDocumentRepository) Exists(id uuid.UUID) (bool, error) {
	return d.db.Exists(id)
}

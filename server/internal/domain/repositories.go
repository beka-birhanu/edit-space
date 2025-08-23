package domain

import (
	"github.com/beka-birhanu/edit-space/server/internal/domain/entities"

	"github.com/google/uuid"
)

type OperationRepository interface {
	FindOne(clientId uuid.UUID, counter int) (entities.Operation, error)
	FindByClientId(clientId uuid.UUID) ([]entities.Operation, error)
	FindByDocumentId(documentId uuid.UUID) ([]entities.Operation, error)
	Find(documentId uuid.UUID, clientId *uuid.UUID, counter *int,
		operationType *entities.OperationType) ([]entities.Operation, error)
	FindAll() ([]entities.Operation, error)
	Save(operation entities.Operation) error
	SaveMany(operations []entities.Operation) error
	Delete(operation entities.Operation) error
	DeleteMany(operations []entities.Operation) error
	Exists(id uuid.UUID) (bool, error)
}

type UserRepository interface {
	Find(id uuid.UUID) (entities.User, error)
	FindAll() ([]entities.User, error)
	FindByUsername(username string) (entities.User, error)
	Save(user entities.User) error
	Delete(user entities.User) error
	Exists(id uuid.UUID) (bool, error)
}

type UserCredentialRepository interface {
	Find(userId uuid.UUID) (entities.UserCredential, error)
	Save(userCredential entities.UserCredential) error
	Delete(userCredential entities.UserCredential) error
	Exists(userId uuid.UUID) (bool, error)
}

type DocumentRepository interface {
	Find(id uuid.UUID) (entities.Document, error)
	FindAll() ([]entities.Document, error)
	FindByUserId(userId uuid.UUID) ([]entities.Document, error)
	Save(document entities.Document) error
	Update(document entities.Document) error
	Delete(document entities.Document) error
	Exists(id uuid.UUID) (bool, error)
}

type CharacterRepository interface {
	Find(id uuid.UUID) (entities.Character, error)
	FindByDocumentId(documentId uuid.UUID) ([]entities.Character, error)
	FindAll() ([]entities.Character, error)
	Save(character entities.Character) error
	SaveMany(characters []entities.Character) error
	Delete(character entities.Character) error
	DeleteMany(characters []entities.Character) error
	Exists(id uuid.UUID) (bool, error)
}

type SessionRepository interface {
	Find(id uuid.UUID) (entities.Session, error)
	FindAll() ([]entities.Session, error)
	FindByUserId(userId uuid.UUID) ([]entities.Session, error)
	Save(session entities.Session) error
	Delete(session entities.Session) error
	Exists(id uuid.UUID) (bool, error)
}

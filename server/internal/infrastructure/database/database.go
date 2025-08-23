package database

import "github.com/google/uuid"

type Database[T any] interface {
	CreateTable() error
	DropTable() error
	Reset() error
	FindOne(columns string, args ...interface{}) (T, error)
	Find(columns string, args ...interface{}) ([]T, error)
	FindAll() ([]T, error)
	Save(entity T) error
	SaveMany(entities []T) error
	Update(entity T) error
	UpdateMany(entities []T) error
	Delete(entity T) error
	DeleteMany(entities []T) error
	Exists(id uuid.UUID) (bool, error)
	RawQuery(query string, args ...interface{}) ([]T, error)
}

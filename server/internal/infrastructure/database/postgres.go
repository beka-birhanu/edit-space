package database

import (
	"context"
	"github.com/google/uuid"

	"github.com/uptrace/bun"
)

type PostgresDB[T any] struct {
	db *bun.DB
}

func NewPostgresDB[T any](db *bun.DB) *PostgresDB[T] {
	return &PostgresDB[T]{db: db}
}

func (p *PostgresDB[T]) CreateTable() error {
	_, err := p.db.NewCreateTable().Model((*T)(nil)).Exec(context.Background())
	return err
}

func (p *PostgresDB[T]) DropTable() error {
	_, err := p.db.NewDropTable().Model((*T)(nil)).Exec(context.Background())
	return err
}

func (p *PostgresDB[T]) Reset() error {
	return p.db.ResetModel(context.Background(), (*T)(nil))
}

func (p *PostgresDB[T]) FindOne(columns string, args ...interface{}) (T, error) {
	var entity T
	err := p.db.NewSelect().Model(&entity).Where(columns, args...).Limit(1).Scan(context.Background())
	return entity, err
}

func (p *PostgresDB[T]) Find(columns string, args ...interface{}) ([]T, error) {
	var entities []T
	err := p.db.NewSelect().Model(&entities).Where(columns, args...).Scan(context.Background())
	return entities, err
}

func (p *PostgresDB[T]) FindAll() ([]T, error) {
	var entities []T
	err := p.db.NewSelect().Model(&entities).Scan(context.Background())
	return entities, err
}

func (p *PostgresDB[T]) FindWhere(where map[string]interface{}) ([]T, error) {
	var entities []T
	query := p.db.NewSelect().Model(&entities)
	for k, v := range where {
		query = query.Where(k+" = ?", v)
	}
	err := query.Scan(context.Background())
	return entities, err
}

func (p *PostgresDB[T]) Save(entity T) error {
	_, err := p.db.NewInsert().Model(&entity).Exec(context.Background())
	return err
}

func (p *PostgresDB[T]) SaveMany(entities []T) error {
	_, err := p.db.NewInsert().Model(&entities).Exec(context.Background())
	return err
}

func (p *PostgresDB[T]) Update(entity T) error {
	_, err := p.db.NewUpdate().Model(&entity).WherePK().Exec(context.Background())
	return err
}

func (p *PostgresDB[T]) UpdateMany(entities []T) error {
	_, err := p.db.NewUpdate().Model(&entities).WherePK().Exec(context.Background())
	return err
}

func (p *PostgresDB[T]) Delete(entity T) error {
	_, err := p.db.NewDelete().Model(&entity).WherePK().Exec(context.Background())
	return err
}

func (p *PostgresDB[T]) DeleteMany(entities []T) error {
	_, err := p.db.NewDelete().Model(&entities).WherePK().Exec(context.Background())
	return err
}

func (p *PostgresDB[T]) Exists(id uuid.UUID) (bool, error) {
	exists, err := p.db.NewSelect().Model((*T)(nil)).Where("id = ?", id).Exists(context.Background())
	return exists, err
}

func (p *PostgresDB[T]) RawQuery(query string, args ...interface{}) ([]T, error) {
	result, err := p.db.Query(query, args)
	if err != nil {
		return nil, err
	}

	var entities []T
	for result.Next() {
		var entity T
		result.Scan(&entity)
		entities = append(entities, entity)
	}

	return entities, nil
}

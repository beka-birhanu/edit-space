package services

import (
	"errors"

	"github.com/beka-birhanu/edit-space/server/internal/domain"
	"github.com/beka-birhanu/edit-space/server/internal/domain/entities"

	"github.com/google/uuid"
)

type OperationService struct {
	operationRepository domain.OperationRepository
	characterRepository domain.CharacterRepository
}

func NewOperationService(
	operationRepository domain.OperationRepository,
	characterRepository domain.CharacterRepository) *OperationService {
	return &OperationService{
		operationRepository: operationRepository,
		characterRepository: characterRepository,
	}
}

func (o *OperationService) Find(documentId uuid.UUID, clientId *uuid.UUID, counter *int,
	operationType *entities.OperationType) ([]entities.Operation, error) {
	return o.operationRepository.Find(documentId, clientId, counter, operationType)
}

func (o *OperationService) ApplyAndSave(operation entities.Operation) error {
	if err := o.applyOperation(operation); err != nil {
		return err
	}
	return o.save(operation)
}

func (o *OperationService) ApplyAndSaveMany(operations []entities.Operation) error {
	if err := o.applyOperations(operations); err != nil {
		return err
	}
	return o.SaveMany(operations)
}

func (o *OperationService) applyOperation(operation entities.Operation) error {
	if operation.Type == entities.OperationTypeInsert {
		return o.applyInsert(operation)
	}
	return o.applyDelete(operation)
}

func (o *OperationService) applyOperations(operations []entities.Operation) error {
	var insertOps []entities.Operation
	var deleteOps []entities.Operation

	for _, operation := range operations {
		if operation.Type == entities.OperationTypeInsert {
			insertOps = append(insertOps, operation)
		} else {
			deleteOps = append(deleteOps, operation)
		}
	}

	if err := o.applyInsertMany(insertOps); err != nil {
		return err
	}

	return o.applyDeleteMany(deleteOps)
}

func (o *OperationService) applyInsert(operation entities.Operation) error {
	if operation.Type != entities.OperationTypeInsert {
		return errors.New("operation type must be insert")
	}

	chr := entities.NewCharacter(
		operation.ChrId,
		operation.DocumentId,
		operation.Position,
		operation.Value)

	return o.characterRepository.Save(chr)
}

func (o *OperationService) applyInsertMany(operations []entities.Operation) error {
	var characters []entities.Character
	for _, operation := range operations {
		if operation.Type != entities.OperationTypeInsert {
			return errors.New("operation type must be insert")
		}
		chr := entities.NewCharacter(
			operation.ChrId,
			operation.DocumentId,
			operation.Position,
			operation.Value,
		)
		characters = append(characters, chr)
	}

	return o.characterRepository.SaveMany(characters)
}

func (o *OperationService) applyDelete(operation entities.Operation) error {
	if operation.Type != entities.OperationTypeDelete {
		return errors.New("operation type must be delete")
	}

	chr := entities.NewCharacter(
		operation.ChrId,
		operation.DocumentId,
		operation.Position,
		operation.Value)

	return o.characterRepository.Delete(chr)
}

func (o *OperationService) applyDeleteMany(operations []entities.Operation) error {
	var characters []entities.Character
	for _, operation := range operations {
		if operation.Type != entities.OperationTypeDelete {
			return errors.New("operation type must be delete")
		}
		chr := entities.NewCharacter(
			operation.ChrId,
			operation.DocumentId,
			operation.Position,
			operation.Value,
		)
		characters = append(characters, chr)
	}

	o.characterRepository.DeleteMany(characters)

	return nil
}

func (o *OperationService) save(operation entities.Operation) error {
	return o.operationRepository.Save(operation)
}

func (o *OperationService) SaveMany(operations []entities.Operation) error {
	return o.operationRepository.SaveMany(operations)
}

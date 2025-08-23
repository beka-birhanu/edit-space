package services

import (
	"github.com/beka-birhanu/edit-space/server/internal/domain"
	"github.com/beka-birhanu/edit-space/server/internal/domain/entities"
	"github.com/google/uuid"
)

type UserService struct {
	userRepository domain.UserRepository
}

func NewUserService(userRepository domain.UserRepository) *UserService {
	return &UserService{userRepository: userRepository}
}

func (us *UserService) GetUser(id uuid.UUID) (entities.User, error) {
	return us.userRepository.Find(id)
}

func (us *UserService) GetUserName(id uuid.UUID) (string, error) {
	user, err := us.userRepository.Find(id)
	if err != nil {
		return "", err
	}
	return user.Username, nil
}

func (us *UserService) Delete(id uuid.UUID) error {
	user, err := us.userRepository.Find(id)
	if err != nil {
		return err
	}
	return us.userRepository.Delete(user)
}

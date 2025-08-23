package services

import (
	"errors"

	"github.com/beka-birhanu/edit-space/server/internal/domain"
	"github.com/beka-birhanu/edit-space/server/internal/domain/entities"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepository       domain.UserRepository
	credentialRepository domain.UserCredentialRepository
	hasher               entities.Hasher
}

func NewAuthService(userRepository domain.UserRepository,
	credentialRepository domain.UserCredentialRepository,
) *AuthService {
	return &AuthService{userRepository: userRepository, credentialRepository: credentialRepository, hasher: NewBcryptHasher()}
}

func (as *AuthService) Create(username string, password string) (uuid.UUID, error) {
	userId := uuid.New()
	user := entities.NewUser(userId, username)

	_, err := as.userRepository.FindByUsername(username)
	if err == nil {
		return uuid.Nil, errors.New("username exists")
	}

	credentials, err := entities.NewUserCredentialFromUserAndPassword(user, password, as.hasher)
	if err != nil {
		return uuid.Nil, err
	}

	err = as.userRepository.Save(user)
	if err != nil {
		return uuid.Nil, err
	}

	err = as.credentialRepository.Save(credentials)
	if err != nil {
		as.userRepository.Delete(user)
		return uuid.Nil, err
	}

	return userId, nil
}

func (as *AuthService) Authenticate(username string, password string) (uuid.UUID, error) {
	user, err := as.userRepository.FindByUsername(username)
	if err != nil {
		return uuid.Nil, err
	}

	credentials, err := as.credentialRepository.Find(user.Id)
	if err != nil {
		return uuid.Nil, errors.New("user not found")
	}

	err = as.hasher.Compare(password, credentials.PassHash)
	if err != nil {
		return uuid.Nil, errors.New("invalid credentials")
	}

	return user.Id, nil
}

func (as *AuthService) DeleteUser(userId uuid.UUID) error {
	user, err := as.userRepository.Find(userId)
	if err != nil {
		return err
	}

	credentials, err := as.credentialRepository.Find(user.Id)
	if err != nil {
		return err
	}

	err = as.credentialRepository.Delete(credentials)
	if err != nil {
		return err
	}

	return as.credentialRepository.Delete(credentials)
}

type BcryptHasher struct{}

func NewBcryptHasher() BcryptHasher {
	return BcryptHasher{}
}

func (b BcryptHasher) Hash(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(hash), err
}

func (b BcryptHasher) Compare(password string, hash string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}

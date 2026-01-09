package application

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/hector/easy-commit/internal/config"
	"github.com/hector/easy-commit/internal/domain"
	"github.com/hector/easy-commit/internal/shared"
)

// MockGitRepository is a mock implementation of domain.GitRepository for testing
type MockGitRepository struct {
	isGitRepo         bool
	hasStagedChanges  bool
	commitError       error
	lastCommitMessage string
	commitCallCount   int
	lastCommittedMsg  string
}

func NewMockGitRepository() *MockGitRepository {
	return &MockGitRepository{
		isGitRepo:        true,
		hasStagedChanges: true,
	}
}

func (m *MockGitRepository) IsGitRepository() bool {
	return m.isGitRepo
}

func (m *MockGitRepository) HasStagedChanges() bool {
	return m.hasStagedChanges
}

func (m *MockGitRepository) Commit(ctx context.Context, message string) error {
	m.commitCallCount++
	m.lastCommittedMsg = message
	return m.commitError
}

func (m *MockGitRepository) GetLastCommitMessage() (string, error) {
	if m.lastCommitMessage == "" {
		return "", errors.New("no commits")
	}
	return m.lastCommitMessage, nil
}

// MockValidator is a mock implementation of domain.CommitValidator for testing
type MockValidator struct {
	validateError error
	validateCalls int
}

func NewMockValidator() *MockValidator {
	return &MockValidator{}
}

func (m *MockValidator) Validate(ctx context.Context, commit domain.Commit) error {
	m.validateCalls++
	return m.validateError
}

func TestNewCommitService(t *testing.T) {
	cfg := config.DefaultConfig()
	logger := shared.NewLogger(shared.ERROR)
	mockRepo := NewMockGitRepository()
	mockValidator := NewMockValidator()

	service := NewCommitService(mockRepo, mockValidator, logger, cfg)

	if service == nil {
		t.Fatal("NewCommitService() returned nil")
	}

	if service.gitRepo == nil {
		t.Error("gitRepo not set")
	}

	if service.validator == nil {
		t.Error("validator not set")
	}

	if service.logger == nil {
		t.Error("logger not set")
	}

	if service.config == nil {
		t.Error("config not set")
	}
}

func TestCommitService_CreateCommit_Success(t *testing.T) {
	cfg := config.DefaultConfig()
	logger := shared.NewLogger(shared.ERROR)
	mockRepo := NewMockGitRepository()
	mockValidator := NewMockValidator()

	service := NewCommitService(mockRepo, mockValidator, logger, cfg)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = "add new feature"

	err := service.CreateCommit(ctx, commit)

	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	if mockValidator.validateCalls != 1 {
		t.Errorf("Expected validator to be called once, got %d", mockValidator.validateCalls)
	}

	if mockRepo.commitCallCount != 1 {
		t.Errorf("Expected git commit to be called once, got %d", mockRepo.commitCallCount)
	}

	expectedMsg := "feat: add new feature"
	if mockRepo.lastCommittedMsg != expectedMsg {
		t.Errorf("Expected commit message %q, got %q", expectedMsg, mockRepo.lastCommittedMsg)
	}
}

func TestCommitService_CreateCommit_NotGitRepository(t *testing.T) {
	cfg := config.DefaultConfig()
	logger := shared.NewLogger(shared.ERROR)
	mockRepo := NewMockGitRepository()
	mockRepo.isGitRepo = false
	mockValidator := NewMockValidator()

	service := NewCommitService(mockRepo, mockValidator, logger, cfg)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = "test"

	err := service.CreateCommit(ctx, commit)

	if err == nil {
		t.Error("Expected error when not in git repository")
	}

	if !strings.Contains(err.Error(), "git repository") {
		t.Errorf("Expected error about git repository, got: %v", err)
	}

	if mockRepo.commitCallCount != 0 {
		t.Error("Git commit should not have been called")
	}
}

func TestCommitService_CreateCommit_NoStagedChanges(t *testing.T) {
	cfg := config.DefaultConfig()
	logger := shared.NewLogger(shared.ERROR)
	mockRepo := NewMockGitRepository()
	mockRepo.hasStagedChanges = false
	mockValidator := NewMockValidator()

	service := NewCommitService(mockRepo, mockValidator, logger, cfg)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = "test"

	err := service.CreateCommit(ctx, commit)

	if err == nil {
		t.Error("Expected error when no staged changes")
	}

	if !strings.Contains(err.Error(), "staged changes") {
		t.Errorf("Expected error about staged changes, got: %v", err)
	}

	if mockRepo.commitCallCount != 0 {
		t.Error("Git commit should not have been called")
	}
}

func TestCommitService_CreateCommit_ValidationFails(t *testing.T) {
	cfg := config.DefaultConfig()
	logger := shared.NewLogger(shared.ERROR)
	mockRepo := NewMockGitRepository()
	mockValidator := NewMockValidator()
	mockValidator.validateError = shared.ErrEmptyDescription

	service := NewCommitService(mockRepo, mockValidator, logger, cfg)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = ""

	err := service.CreateCommit(ctx, commit)

	if err == nil {
		t.Error("Expected validation error")
	}

	if mockValidator.validateCalls != 1 {
		t.Errorf("Expected validator to be called once, got %d", mockValidator.validateCalls)
	}

	if mockRepo.commitCallCount != 0 {
		t.Error("Git commit should not have been called after validation failure")
	}
}

func TestCommitService_CreateCommit_GitCommitFails(t *testing.T) {
	cfg := config.DefaultConfig()
	logger := shared.NewLogger(shared.ERROR)
	mockRepo := NewMockGitRepository()
	mockRepo.commitError = errors.New("git commit failed")
	mockValidator := NewMockValidator()

	service := NewCommitService(mockRepo, mockValidator, logger, cfg)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = "test"

	err := service.CreateCommit(ctx, commit)

	if err == nil {
		t.Error("Expected git commit error")
	}

	if !strings.Contains(err.Error(), "git commit failed") {
		t.Errorf("Expected git error, got: %v", err)
	}

	if mockRepo.commitCallCount != 1 {
		t.Errorf("Expected git commit to be attempted, got %d calls", mockRepo.commitCallCount)
	}
}

func TestCommitService_CreateCommit_WithScope(t *testing.T) {
	cfg := config.DefaultConfig()
	logger := shared.NewLogger(shared.ERROR)
	mockRepo := NewMockGitRepository()
	mockValidator := NewMockValidator()

	service := NewCommitService(mockRepo, mockValidator, logger, cfg)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFix
	commit.Description = "resolve authentication bug"
	commit.Scope = "auth"

	err := service.CreateCommit(ctx, commit)

	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	expectedMsg := "fix(auth): resolve authentication bug"
	if mockRepo.lastCommittedMsg != expectedMsg {
		t.Errorf("Expected commit message %q, got %q", expectedMsg, mockRepo.lastCommittedMsg)
	}
}

func TestCommitService_CreateCommit_WithBody(t *testing.T) {
	cfg := config.DefaultConfig()
	logger := shared.NewLogger(shared.ERROR)
	mockRepo := NewMockGitRepository()
	mockValidator := NewMockValidator()

	service := NewCommitService(mockRepo, mockValidator, logger, cfg)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = "add new feature"
	commit.Body = "This is a detailed explanation of the feature"

	err := service.CreateCommit(ctx, commit)

	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	if !strings.Contains(mockRepo.lastCommittedMsg, "feat: add new feature") {
		t.Error("Commit message missing header")
	}

	if !strings.Contains(mockRepo.lastCommittedMsg, "This is a detailed explanation") {
		t.Error("Commit message missing body")
	}
}

func TestCommitService_CreateCommit_BreakingChange(t *testing.T) {
	cfg := config.DefaultConfig()
	logger := shared.NewLogger(shared.ERROR)
	mockRepo := NewMockGitRepository()
	mockValidator := NewMockValidator()

	service := NewCommitService(mockRepo, mockValidator, logger, cfg)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = "change API structure"
	commit.Breaking = true
	commit.Body = "Restructured the API"

	err := service.CreateCommit(ctx, commit)

	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	if !strings.Contains(mockRepo.lastCommittedMsg, "feat!:") {
		t.Error("Breaking change marker '!' missing")
	}

	if !strings.Contains(mockRepo.lastCommittedMsg, "BREAKING CHANGE:") {
		t.Error("BREAKING CHANGE footer missing")
	}
}

func TestCommitService_PreviewCommit(t *testing.T) {
	cfg := config.DefaultConfig()
	logger := shared.NewLogger(shared.ERROR)
	mockRepo := NewMockGitRepository()
	mockValidator := NewMockValidator()

	service := NewCommitService(mockRepo, mockValidator, logger, cfg)

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = "add preview feature"
	commit.Scope = "ui"

	preview := service.PreviewCommit(commit)

	expectedMsg := "feat(ui): add preview feature"
	if preview != expectedMsg {
		t.Errorf("Expected preview %q, got %q", expectedMsg, preview)
	}
}

func TestCommitService_GetConfig(t *testing.T) {
	cfg := config.DefaultConfig()
	logger := shared.NewLogger(shared.ERROR)
	mockRepo := NewMockGitRepository()
	mockValidator := NewMockValidator()

	service := NewCommitService(mockRepo, mockValidator, logger, cfg)

	returnedCfg := service.GetConfig()

	if returnedCfg == nil {
		t.Fatal("GetConfig() returned nil")
	}

	if returnedCfg.Commit.MaxDescriptionLength != cfg.Commit.MaxDescriptionLength {
		t.Error("GetConfig() returned different config")
	}
}

func TestCommitService_CreateCommit_CompleteFlow(t *testing.T) {
	cfg := config.DefaultConfig()
	logger := shared.NewLogger(shared.ERROR)
	mockRepo := NewMockGitRepository()
	mockValidator := NewMockValidator()

	service := NewCommitService(mockRepo, mockValidator, logger, cfg)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeRefactor
	commit.Description = "improve performance"
	commit.Scope = "core"
	commit.Body = "Optimized algorithms for better speed"
	commit.Breaking = false

	err := service.CreateCommit(ctx, commit)

	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	// Verify the complete flow
	if mockValidator.validateCalls != 1 {
		t.Error("Validation should have been called")
	}

	if mockRepo.commitCallCount != 1 {
		t.Error("Git commit should have been called")
	}

	// Verify complete message format
	msg := mockRepo.lastCommittedMsg
	if !strings.Contains(msg, "refactor(core): improve performance") {
		t.Error("Message missing proper header")
	}
	if !strings.Contains(msg, "Optimized algorithms") {
		t.Error("Message missing body")
	}
}

func TestCommitService_CreateCommit_AllCommitTypes(t *testing.T) {
	cfg := config.DefaultConfig()
	logger := shared.NewLogger(shared.ERROR)
	commitTypes := domain.CommitTypes{}.GetDefault()

	for _, commitType := range commitTypes {
		t.Run(commitType.Name, func(t *testing.T) {
			mockRepo := NewMockGitRepository()
			mockValidator := NewMockValidator()
			service := NewCommitService(mockRepo, mockValidator, logger, cfg)
			ctx := context.Background()

			commit := domain.NewCommit(&cfg.Commit)
			commit.Type = commitType
			commit.Description = "test " + commitType.Name

			err := service.CreateCommit(ctx, commit)

			if err != nil {
				t.Errorf("Unexpected error for %s: %v", commitType.Name, err)
			}

			if !strings.HasPrefix(mockRepo.lastCommittedMsg, commitType.Name+":") {
				t.Errorf("Message should start with %s:, got: %s", commitType.Name, mockRepo.lastCommittedMsg)
			}
		})
	}
}

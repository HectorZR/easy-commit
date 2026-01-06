package application

import (
	"context"
	"fmt"
	"sync"

	"github.com/hector/easy-commit/internal/config"
	"github.com/hector/easy-commit/internal/domain"
	"github.com/hector/easy-commit/internal/shared"
)

type ConcurrentValidator struct {
	config *config.ValidatorConfig
}

func NewConcurrentValidator(cfg *config.ValidatorConfig) *ConcurrentValidator {
	return &ConcurrentValidator{
		config: cfg,
	}
}

// Validate performs concurrent validation of the commit.
func (v *ConcurrentValidator) Validate(ctx context.Context, commit domain.Commit) error {
	rules := []func(domain.Commit) error{
		func(c domain.Commit) error {
			if !c.Type.IsValid() {
				return shared.WrapError(shared.ErrInvalidCommitType, fmt.Sprintf("commit type '%s' is invalid", c.Type.Name))
			}
			return nil
		},
		func(c domain.Commit) error {
			return c.Validate()
		},
	}

	jobs := make(chan func(c domain.Commit) error, len(rules))
	results := make(chan error, len(rules))

	// Start worker pool
	var wg sync.WaitGroup
	for i := 0; i < v.config.WorkerCount; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				case rule, ok := <-jobs:
					if !ok {
						return
					}
					results <- rule(commit)
				}
			}
		}()
	}

	// Send jobs
	go func() {
		for _, rule := range rules {
			jobs <- rule
		}
		close(jobs)
	}()

	// Wait and close results
	go func() {
		wg.Wait()
		close(results)
	}()

	// Collect results
	for err := range results {
		if err != nil {
			return err
		}
	}

	return nil
}

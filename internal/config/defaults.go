package config

import "time"

// DefaultConfig returns the default configuration
func DefaultConfig() *Config {
	return &Config{
		Commit: CommitConfig{
			MaxDescriptionLength: 72,
			MaxBodyLineLength:    72,
			MaxBodyLength:        500,
			InvalidScopeChars:    " \t\n()",
		},
		Timeouts: TimeoutsConfig{
			Validation: 2 * time.Second,
			UserInput:  30 * time.Second,
			GitCommand: 5 * time.Second,
			Context:    5 * time.Minute,
		},
		Validator: ValidatorConfig{
			WorkerCount: 4,
		},
		Logger: LoggerConfig{
			Level: "INFO",
		},
	}
}

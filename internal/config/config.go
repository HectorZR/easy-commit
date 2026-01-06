package config

import "time"

// Config represents the complete configuration of the application
type Config struct {
	Commit    CommitConfig    `yaml:"commit"`
	Timeouts  TimeoutsConfig  `yaml:"timeouts"`
	Validator ValidatorConfig `yaml:"validator"`
	Logger    LoggerConfig    `yaml:"logger"`
}

// CommitConfig contains configurations related to commits
type CommitConfig struct {
	MaxDescriptionLength int    `yaml:"max_description_length"`
	MaxBodyLineLength    int    `yaml:"max_body_line_length"`
	MaxBodyLength        int    `yaml:"max_body_length"`
	InvalidScopeChars    string `yaml:"invalid_scope_chars"`
}

// TimeoutsConfig contains all application timeouts
type TimeoutsConfig struct {
	Validation time.Duration `yaml:"validation"`
	UserInput  time.Duration `yaml:"user_input"`
	GitCommand time.Duration `yaml:"git_command"`
	Context    time.Duration `yaml:"context"`
}

// ValidatorConfig contains validator configuration
type ValidatorConfig struct {
	WorkerCount int `yaml:"worker_count"`
}

// LoggerConfig contains logger configuration
type LoggerConfig struct {
	Level string `yaml:"level"` // DEBUG, INFO, WARN, ERROR
}

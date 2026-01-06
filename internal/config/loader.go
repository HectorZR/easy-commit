package config

import (
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

// ConfigFileNames are the filenames to search for (in order of priority)
var ConfigFileNames = []string{
	".easy-commit.yaml",
	".easy-commit.yml",
	"easy-commit.yaml",
	"easy-commit.yml",
}

// Load loads the configuration from file or returns the default configuration
// Searches for the file in the current directory first, then in HOME
func Load() (*Config, error) {
	// Try to load from file
	cfg, err := loadFromFile()
	if err == nil {
		return cfg, nil
	}

	// If no file is found, return default values
	return DefaultConfig(), nil
}

// loadFromFile attempts to load configuration from file
func loadFromFile() (*Config, error) {
	// Search in current directory
	for _, name := range ConfigFileNames {
		if cfg, err := readConfigFile(name); err == nil {
			return cfg, nil
		}
	}

	// Search in HOME directory
	homeDir, err := os.UserHomeDir()
	if err == nil {
		for _, name := range ConfigFileNames {
			path := filepath.Join(homeDir, name)
			if cfg, err := readConfigFile(path); err == nil {
				return cfg, nil
			}
		}
	}

	return nil, os.ErrNotExist
}

// readConfigFile reads and parses a YAML configuration file
func readConfigFile(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	// Start with default values
	cfg := DefaultConfig()

	// Override with values from file
	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, err
	}

	return cfg, nil
}

// LoadOrDefault is a helper that never fails, always returns a valid configuration
func LoadOrDefault() *Config {
	cfg, _ := Load()
	if cfg == nil {
		cfg = DefaultConfig()
	}
	return cfg
}

package domain

import (
	"testing"
)

func TestCommitType_IsValid(t *testing.T) {
	tests := []struct {
		name     string
		ct       CommitType
		expected bool
	}{
		{
			name:     "valid type - feat",
			ct:       CommitType{Name: "feat"},
			expected: true,
		},
		{
			name:     "valid type - fix",
			ct:       CommitType{Name: "fix"},
			expected: true,
		},
		{
			name:     "valid type - docs",
			ct:       CommitType{Name: "docs"},
			expected: true,
		},
		{
			name:     "empty type name",
			ct:       CommitType{Name: ""},
			expected: false,
		},
		{
			name:     "type with uppercase letters",
			ct:       CommitType{Name: "Feat"},
			expected: false,
		},
		{
			name:     "type with numbers",
			ct:       CommitType{Name: "feat123"},
			expected: false,
		},
		{
			name:     "type with special characters",
			ct:       CommitType{Name: "feat-fix"},
			expected: false,
		},
		{
			name:     "type with spaces",
			ct:       CommitType{Name: "feat fix"},
			expected: false,
		},
		{
			name:     "type with whitespace only",
			ct:       CommitType{Name: "   "},
			expected: false,
		},
		{
			name:     "type with leading/trailing spaces (trimmed, so valid)",
			ct:       CommitType{Name: " feat "},
			expected: true, // TrimSpace is applied, so this becomes valid
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.ct.IsValid()
			if result != tt.expected {
				t.Errorf("Expected IsValid() = %v for type %q, got %v", tt.expected, tt.ct.Name, result)
			}
		})
	}
}

func TestCommitType_String(t *testing.T) {
	tests := []struct {
		name     string
		ct       CommitType
		expected string
	}{
		{
			name:     "feat type",
			ct:       TypeFeat,
			expected: "feat",
		},
		{
			name:     "fix type",
			ct:       TypeFix,
			expected: "fix",
		},
		{
			name:     "custom type",
			ct:       CommitType{Name: "custom"},
			expected: "custom",
		},
		{
			name:     "empty type",
			ct:       CommitType{Name: ""},
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.ct.String()
			if result != tt.expected {
				t.Errorf("Expected String() = %q, got %q", tt.expected, result)
			}
		})
	}
}

func TestCommitTypes_GetByName(t *testing.T) {
	commitTypes := CommitTypes{
		TypeFeat,
		TypeFix,
		TypeDocs,
	}

	tests := []struct {
		name     string
		input    string
		expected CommitType
		wantErr  bool
	}{
		{
			name:     "find feat",
			input:    "feat",
			expected: TypeFeat,
			wantErr:  false,
		},
		{
			name:     "find fix",
			input:    "fix",
			expected: TypeFix,
			wantErr:  false,
		},
		{
			name:     "find docs",
			input:    "docs",
			expected: TypeDocs,
			wantErr:  false,
		},
		{
			name:     "case insensitive - FEAT",
			input:    "FEAT",
			expected: TypeFeat,
			wantErr:  false,
		},
		{
			name:     "case insensitive - FiX",
			input:    "FiX",
			expected: TypeFix,
			wantErr:  false,
		},
		{
			name:     "with whitespace",
			input:    " feat ",
			expected: TypeFeat,
			wantErr:  false,
		},
		{
			name:    "non-existent type",
			input:   "nonexistent",
			wantErr: true,
		},
		{
			name:    "empty string",
			input:   "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := commitTypes.GetByName(tt.input)

			if tt.wantErr {
				if err == nil {
					t.Error("Expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}

			if result.Name != tt.expected.Name {
				t.Errorf("Expected type %q, got %q", tt.expected.Name, result.Name)
			}
		})
	}
}

func TestCommitTypes_GetDefault(t *testing.T) {
	types := CommitTypes{}.GetDefault()

	if len(types) == 0 {
		t.Fatal("GetDefault() returned empty slice")
	}

	expectedCount := 10 // feat, fix, docs, style, refactor, test, chore, build, ci, perf
	if len(types) != expectedCount {
		t.Errorf("Expected %d commit types, got %d", expectedCount, len(types))
	}

	// Check that all expected types are present
	expectedTypes := []string{
		"feat", "fix", "docs", "style", "refactor",
		"test", "chore", "build", "ci", "perf",
	}

	foundTypes := make(map[string]bool)
	for _, ct := range types {
		foundTypes[ct.Name] = true
	}

	for _, expected := range expectedTypes {
		if !foundTypes[expected] {
			t.Errorf("Expected type %q not found in default types", expected)
		}
	}

	// Verify all types are valid
	for _, ct := range types {
		if !ct.IsValid() {
			t.Errorf("Invalid commit type in defaults: %q", ct.Name)
		}
		if ct.Description == "" {
			t.Errorf("Commit type %q has empty description", ct.Name)
		}
	}
}

func TestPredefinedCommitTypes(t *testing.T) {
	tests := []struct {
		name           string
		commitType     CommitType
		expectedName   string
		hasDescription bool
	}{
		{
			name:           "TypeFeat",
			commitType:     TypeFeat,
			expectedName:   "feat",
			hasDescription: true,
		},
		{
			name:           "TypeFix",
			commitType:     TypeFix,
			expectedName:   "fix",
			hasDescription: true,
		},
		{
			name:           "TypeDocs",
			commitType:     TypeDocs,
			expectedName:   "docs",
			hasDescription: true,
		},
		{
			name:           "TypeStyle",
			commitType:     TypeStyle,
			expectedName:   "style",
			hasDescription: true,
		},
		{
			name:           "TypeRefactor",
			commitType:     TypeRefactor,
			expectedName:   "refactor",
			hasDescription: true,
		},
		{
			name:           "TypeTest",
			commitType:     TypeTest,
			expectedName:   "test",
			hasDescription: true,
		},
		{
			name:           "TypeChore",
			commitType:     TypeChore,
			expectedName:   "chore",
			hasDescription: true,
		},
		{
			name:           "TypeBuild",
			commitType:     TypeBuild,
			expectedName:   "build",
			hasDescription: true,
		},
		{
			name:           "TypeCi",
			commitType:     TypeCi,
			expectedName:   "ci",
			hasDescription: true,
		},
		{
			name:           "TypePerf",
			commitType:     TypePerf,
			expectedName:   "perf",
			hasDescription: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.commitType.Name != tt.expectedName {
				t.Errorf("Expected name %q, got %q", tt.expectedName, tt.commitType.Name)
			}

			if tt.hasDescription && tt.commitType.Description == "" {
				t.Errorf("Expected non-empty description for %s", tt.name)
			}

			if !tt.commitType.IsValid() {
				t.Errorf("Predefined type %s is not valid", tt.name)
			}
		})
	}
}

func TestCommitTypeConstants(t *testing.T) {
	tests := []struct {
		name     string
		constant string
		expected string
	}{
		{"CommitTypeFeat", CommitTypeFeat, "feat"},
		{"CommitTypeFix", CommitTypeFix, "fix"},
		{"CommitTypeDocs", CommitTypeDocs, "docs"},
		{"CommitTypeStyle", CommitTypeStyle, "style"},
		{"CommitTypeRefactor", CommitTypeRefactor, "refactor"},
		{"CommitTypeTest", CommitTypeTest, "test"},
		{"CommitTypeChore", CommitTypeChore, "chore"},
		{"CommitTypeBuild", CommitTypeBuild, "build"},
		{"CommitTypeCi", CommitTypeCi, "ci"},
		{"CommitTypePerf", CommitTypePerf, "perf"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.constant != tt.expected {
				t.Errorf("Expected constant %s to equal %q, got %q", tt.name, tt.expected, tt.constant)
			}
		})
	}
}

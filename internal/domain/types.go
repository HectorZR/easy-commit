package domain

import "strings"

// CommitType represents a type of commit according to Conventional Commits specification.
type CommitType struct {
	Name        string
	Description string
	// Emoji       string // Optional
}

// Commit type name constants
const (
	CommitTypeBuild    = "build"
	CommitTypeChore    = "chore"
	CommitTypeCi       = "ci"
	CommitTypeDocs     = "docs"
	CommitTypeFeat     = "feat"
	CommitTypeFix      = "fix"
	CommitTypePerf     = "perf"
	CommitTypeRefactor = "refactor"
	CommitTypeStyle    = "style"
	CommitTypeTest     = "test"
)

// Predefined commit types
var (
	TypeBuild    = CommitType{Name: CommitTypeBuild, Description: "Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)"}
	TypeChore    = CommitType{Name: CommitTypeChore, Description: "Changes to the build process or auxiliary tools and libraries such as documentation generation"}
	TypeCi       = CommitType{Name: CommitTypeCi, Description: "Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)"}
	TypeDocs     = CommitType{Name: CommitTypeDocs, Description: "Documentation only changes"}
	TypeFeat     = CommitType{Name: CommitTypeFeat, Description: "A new feature"}
	TypeFix      = CommitType{Name: CommitTypeFix, Description: "A bug fix"}
	TypePerf     = CommitType{Name: CommitTypePerf, Description: "A code change that improves performance"}
	TypeRefactor = CommitType{Name: CommitTypeRefactor, Description: "A code change that neither fixes a bug nor adds a feature"}
	TypeStyle    = CommitType{Name: CommitTypeStyle, Description: "Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)"}
	TypeTest     = CommitType{Name: CommitTypeTest, Description: "Adding missing tests or correcting existing tests"}
)

// IsValid checks if the CommitType name is valid (non-empty and lowercase).
func (ct CommitType) IsValid() bool {
	name := strings.TrimSpace(ct.Name)

	if name == "" {
		return false
	}

	for _, char := range name {
		if char < 'a' || char > 'z' {
			return false
		}
	}

	return true
}

func (ct CommitType) String() string {
	return ct.Name
}

// CommitTypes is a slice of CommitType.
type CommitTypes []CommitType

// GetByName retrieves a CommitType by its name (case-insensitive).
func (cts CommitTypes) GetByName(name string) (CommitType, error) {
	normalizedName := strings.ToLower(strings.TrimSpace(name))
	for _, ct := range cts {
		if strings.ToLower(ct.Name) == normalizedName {
			return ct, nil

		}
	}
	return CommitType{}, ErrInvalidCommitType
}

// GetDefault returns the default set of commit types.
func (cts CommitTypes) GetDefault() CommitTypes {
	return CommitTypes{
		TypeBuild,
		TypeChore,
		TypeCi,
		TypeDocs,
		TypeFeat,
		TypeFix,
		TypePerf,
		TypeRefactor,
		TypeStyle,
		TypeTest,
	}
}

package domain

type CommitType struct {
	Name        string
	Description string
	// Emoji       string // Optional
}

var (
	TypeFeat     = CommitType{Name: "feat", Description: "A new feature"}
	TypeFix      = CommitType{Name: "fix", Description: "A bug fix"}
	TypeDocs     = CommitType{Name: "docs", Description: "Documentation only changes"}
	TypeStyle    = CommitType{Name: "style", Description: "Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)"}
	TypeRefactor = CommitType{Name: "refactor", Description: "A code change that neither fixes a bug nor adds a feature"}
	TypePerf     = CommitType{Name: "perf", Description: "A code change that improves performance"}
	TypeTest     = CommitType{Name: "test", Description: "Adding missing tests or correcting existing tests"}
	TypeChore    = CommitType{Name: "chore", Description: "Changes to the build process or auxiliary tools and libraries such as documentation generation"}
	TypeBuild    = CommitType{Name: "build", Description: "Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)"}
	TypeCi       = CommitType{Name: "ci", Description: "Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)"}
)

func (ct CommitType) IsValid() bool
func (ct CommitType) String() string

type CommitTypes []CommitType

func (cts CommitTypes) GetByName(name string) (CommitType, error)
func (cts CommitTypes) GetDefault() CommitTypes

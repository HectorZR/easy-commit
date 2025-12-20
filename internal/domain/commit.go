package domain

type Commit struct {
	Type        CommitType
	Scope       string // Optional
	Description string
	Body        string // Optional
	Breaking    bool   // Breaking change indicator
}

func (c *Commit) Validate() error
func (c *Commit) Format() string
func (c *Commit) IsBreaking() bool
func (c *Commit) HasScope() bool

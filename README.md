# GitHub Action: Comment Parser

> I Am C-3PO, Human/Cyborg Relations. And You Are?

The action parses comments using predefined patterns.
It will create the output parameters in case of a match with the pattern.
This action can be used to control various CI/CD processes by specifying commands in comments or descriptions of Issues or Pull Requests.

## Example usage

> *Note:* `issue_comment` event will only trigger a workflow run if the workflow file is on the default branch.

### `.github/workflow/droid.yml`

```yml
name: droid
on:
  issue_comment:
    types: [ created ]
jobs:
  uses:
    runs-on: ubuntu-latest
    steps:
    - uses: blablacar/action-c-3po-droid@master
      id: c-3po
      with:
        expect: |
          - pattern: ^/hello (?<value>.+)$
          - pattern: ^/chances (?<output>[^=]+)=(?<value>.*)$
          - command: intrusion
          - command: disappeared
            value: R2-D2

    - if: ${{ steps.c-3po.outputs.is-hello }}
      run: echo "${{ steps.c-3po.outputs.has-hello }}, it is you, it Is You!"

    - if: ${{ steps.c-3po.outputs.is-chances && steps.c-3po.outputs.has-chances-survival }}
      run: echo "R2 says the chances of survival are ${{ steps.c-3po.outputs.has-chances-survival }}... to one"

    - if: ${{ steps.c-3po.outputs.is-chances && steps.c-3po.outputs.has-chances-win > 0 }}
      run: echo "We'll take the next chance, and the next."

    - if: ${{ steps.c-3po.outputs.is-intrusion }}
      run: echo "We're doomed"

    - if: ${{ steps.c-3po.outputs.is-disappeared }}
      run: echo "${{ steps.c-3po.outputs.has-disappeared }}, where are you?"
```

Then try adding comments to the Issue with the following content:
- `/hello R2-D2`
- `/chances survival=725`
- `/chances win=5`
- `/intrusion`
- `/disappeared who?`

## Inputs

### `expect`

A list of objects with patterns and output settings.
This field contains a string with a list in YAML format:

```yaml
- command: <command name>
  pattern: <regex>
  output: <output key>
  value: <value>
```

Each object must have a command or pattern parameter.
After processing the first match in a row, subsequent patterns are ignored for that row.

#### command

Optional.
Specifies the command of the team to be searched for at the beginning of each new comment line.
The command in the comment must start with the `/` character.
You do not need to specify this `/` character in the `command` parameter.
The action returns the output parameters `is-<command>`, `has-<command>` or `has-<command>-<output key>` when the command is found in the comment.

Example:

```yaml
- command: hello
```

Will be a trigger for a comment:

```
/hello world
```

The action will return the parameters:

```
steps.<id>.outputs.is-hello = '/hello world'
steps.<id>.outputs.has-hello = 'world'
```

#### pattern

Optional.
Specifies a regex pattern according to which a match will be searched for in the new comment.
If the command is not defined, it can be determined by the first word that begins in the pattern after `^/`.

The pattern may contain regex named capturing groups that will determine the output key, or data for the output parameters.
- `(?<output>...)` — determines the output key that is appended to the name of the output parameter `has-<command>-<output key>`.
- `(?<value>...)` - determines the data that is contained in the output parameter `has-*`.

Example:

```yaml
- pattern: ^/set (?<output>.+)=(?<value>.*)$
```

Will be a trigger for a comment:

```
/set hello=world
```

The action will return the parameters:

```
steps.<id>.outputs.is-set = '/set hello=world'
steps.<id>.outputs.has-set-hello = 'world'
```

#### output (experimental)

Optional.
Contains the output key that is appended to the name of the output parameter `has-<command>-<output key>`.
Has a higher priority for the named capturing groups in the regex pattern.

#### value (experimental)

Optional.
Contains the data that is contained in the output parameter `has-*`.
Has a higher priority for the named capturing groups in the regex pattern.

### `in`

Optional.
Determines the type of problems in the comments which will be searched for matching patterns.
Possible values are `issue`, `pull_request` or `any`.
The default is `any`.

### `description`

Optional.
Looks for pattern matches in the description at Issue or Pull Request creation if `true` is set.
The default is `false`.

## Outputs

### `is-<command>`

Returns the contents of a row if a pattern or command is matched.
This parameter is present if there is a specified command name in the `command` or `pattern` parameter.

### `has-<command>`

Returns the data defined by `value`, or the content in the line after the command.
This parameter is present if there is a specified:
- command name in the `command` or `pattern` parameter
- `value` in `pattern` or `value` parameter.

### `has-<command>-<output key>`

Returns the data defined by `value`, or the content in the line after the command.
This parameter is present if there is a specified:
- command name in the `command` or `pattern` parameter
- output key in `pattern` or `output` parameter
- `value` in `pattern` or `value` parameter.

### `has-<output key>`

Returns the data defined by `value`, or the content in the line after the command.
This parameter is present if there is a specified:
- output key in `pattern` or `output` parameter
- `value` in `pattern` or `value` parameter.
Also, no command name is specified.

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)

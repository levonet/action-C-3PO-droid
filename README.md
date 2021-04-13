# GitHub Action: Comment Parser

> I Am C-3PO, Human/Cyborg Relations. And You Are?

## Example usage

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
    - uses: levonet/action-C-3PO-droid@master
      id: c-3po
      with:
        expect: |
          - command: help
          - pattern: ^/set (?<output>[^=]+)=(?<value>.*)$
          - pattern: ^/unset (?<output>.+)$
            value: "1"
          - command: chances
            pattern: (?<value>\d+)
          - command: restart
            output: run-deploy

    - if: ${{ steps.c-3po.outputs.help }}
      run: echo "You know better than to trust a strange computer!"

    - if: ${{ steps.c-3po.outputs.set && steps.c-3po.outputs.name }}
      run: echo "${{ steps.c-3po.outputs.name }}, it is you, it Is You!"

    - if: ${{ steps.c-3po.outputs.chances }}
      run: echo "R2 says the chances of survival are ${{ steps.c-3po.outputs.chances }}... to one"

    - if: ${{ steps.c-3po.outputs.unset && steps.c-3po.outputs.R2-D2 == '1' }}
      run: echo "R2-D2, where are you?"

    - if: ${{ steps.c-3po.outputs.run-deploy == 'true' }}
      run: echo "We're doomed"
```

## Inputs

## Outputs

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)

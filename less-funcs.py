import sys,re,json

def repl(match):
        if hasattr(funcs, match.group(1)):
                return getattr(funcs, match.group(1))(match.group(2))
        else:
                return match.group()

class Funcs(object):
        def px2rem(self, value):
                value = value[:-2]
                if ('px2rem' in options):
                        div = options['px2rem']
                else:
                        div = 75
                return str(float(value) / div) + 'rem'

funcs = Funcs()
pFunc = re.compile(r'(\w+)\(([^)]+)\)')
pKey = re.compile(r'(\w+):')

if len(sys.argv) > 1:
        options = json.loads(pKey.sub(r'"\1":', sys.argv[1]))
else:
        options = json.loads("{}")

for line in sys.stdin:
        sys.stdout.write(pFunc.sub(repl, line))

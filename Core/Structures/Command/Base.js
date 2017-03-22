class BaseCommand {
    constructor(options) {
        if (this.constructor === BaseCommand) {
            throw new Error("Can't instantiate an abstract class!");
        }
        this.hidden = options.hidden || false;
        this.name = options.name || this.constructor.name;
        this.flags = options.flags || [];
        this.aliases = options.aliases || [];
    }

    async getInfo(dest) {
        return await this.decode(dest, `${this.base}.info`);
    }

    async getUsage(dest) {
        return await this.decode(dest, `${this.base}.usage`);
    }

    get webInfo() {
        let paragraphs = this.info.replace(/\n+/g, '\n').split('\n');
        let output = '';
        let list = [];
        for (const line of paragraphs) {
            if (line.startsWith(' - ')) {
                list.push(`<li>${line.substring(3)}</li>`);
            } else {
                if (list.length > 0) {
                    output += `<ul>${list.join('')}</ul>`;
                    list = [];
                }
                output += `<p>${line}</p>`;
            }
        }
        output.replace(/```\n((?:.|\n)+?)\n```/gim, '<pre><code>$1</code></pre>')
            .replace(/`((?:.|\n)+?)`/gim, '<code>$1</code>');
        return output;
    }

    async execute(ctx) {
        this.parseInput(ctx);
    }

    async event(params) {

    }

    async send(dest, content, file) {
        await _discord.Core.Helpers.Message.send(dest, content, file);
    }

    async decode(dest, key, args) {
        await _discord.Core.Helpers.Message.decode(dest, key, args);
    }

    async canExecute(ctx) {
        return true;
    }

    async notEnoughParameters(ctx) {
        return await ctx.send(await ctx.decode('error.notenoughparams', {
            name: this.name,
            prefix: 'b!'
        }));
    }

    async genericError(ctx, message) {
        return await ctx.send(await ctx.decode('error.generic', {
            message
        }));
    }

    parseInput(ctx) {
        let words = ctx.words;
        let output = {
            _: []
        };
        let currentFlag = '';
        for (let i = 0; i < words.length; i++) {
            let pushFlag = true;
            if (words[i].startsWith('--')) {
                let parseFlags = this.flags.filter(f => f.word == words[i].substring(2).toLowerCase());
                if (parseFlags.length > 0) {
                    currentFlag = parseFlags[0].flag;
                    output[currentFlag] = [];
                    pushFlag = false;
                }
            } else if (words[i].startsWith('-')) {
                let tempFlag = words[i].substring(1);
                let parseFlags = this.flags.map(f => f.flag);
                let oldFlag = currentFlag, oldOutput = output;
                pushFlag = false;
                for (const char of tempFlag) {
                    if (parseFlags.includes(char)) {
                        currentFlag = char;
                        output[currentFlag] = [];
                    } else {
                        output = oldOutput;
                        currentFlag = oldFlag;
                        pushFlag = true;
                        break;
                    }
                }
            }
            if (pushFlag) {
                if (currentFlag != '') {
                    output[currentFlag].push(words[i]);
                } else {
                    if (words[i] != '')
                        output['_'].push(words[i]);
                }
            }
        }
        ctx.input = output;
    };

    get base() {
        return `command.${this.category}.${this.name}`;
    }
}

module.exports = BaseCommand;
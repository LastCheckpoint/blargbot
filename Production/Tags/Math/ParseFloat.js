const { Math } = require.main.require('./Tag/Classes');

class ParseFloatTag extends Math {
  constructor(client) {
    super(client, {
      name: 'parsefloat',
      args: [
        {
          name: 'number'
        }
      ],
      minArgs: 1, maxArgs: 1
    });
  }

  async execute(ctx, args) {
    const res = await super.execute(ctx, args);

    try {
      let parsed = this.parseFloat(args.parsedArgs.number, 'number');
      res.setContent(parsed);
    } catch (err) {
      res.setContent('NaN');
    }

    return res;
  }
}

module.exports = ParseFloatTag;
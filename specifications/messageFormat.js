
var messageFormat = require('../libraries/MessageFormat')
  , AST = require('../libraries/MessageFormat/AST');

describe('MessageFormat', function() {
  describe('#parse(string)', function() {
    describe('Sentences', function() {
      it('should parse a sentence', function() {
        messageFormat.parse('sentence');
        expect(messageFormat.messageAST[0].string).to.equal('sentence');
        expect(messageFormat.messageAST.length).to.equal(1);
      });

      it('should parse escaped sentences', function() {
        messageFormat.parse('sentence\\{');
        expect(messageFormat.messageAST[0].string).to.equal('sentence\\{');
        expect(messageFormat.messageAST.length).to.equal(1);
        messageFormat.parse('sentence\\}');
        expect(messageFormat.messageAST[0].string).to.equal('sentence\\}');
        expect(messageFormat.messageAST.length).to.equal(1);
        messageFormat.parse('\\{sentence\\{');
        expect(messageFormat.messageAST[0].string).to.equal('\\{sentence\\{');
        expect(messageFormat.messageAST.length).to.equal(1);
      });

      it('should throw an error if an unescaped reserved character is used', function() {
        function method() {
          messageFormat.parse('sentence {');
        }
        expect(method).to.throw(TypeError, 'Could not parse variable in sentence {')
      });
    });

    describe('Variables', function() {
      it('should parse a sentence with a single variable', function() {
        messageFormat.parse('sentence {variable1}');
        expect(messageFormat.messageAST[0].string).to.equal('sentence ');
        expect(messageFormat.messageAST[1].name).to.equal('variable1');
        expect(messageFormat.messageAST.length).to.equal(2);
      });

      it('should parse a message with multiple variables', function() {
        messageFormat.parse('{variable1} {variable2}');
        expect(messageFormat.messageAST[0].name).to.equal('variable1');
        expect(messageFormat.messageAST[1].string).to.equal(' ');
        expect(messageFormat.messageAST[2].name).to.equal('variable2');
        expect(messageFormat.messageAST.length).to.equal(3);
      });

      it('should parse a sentence with multiple subsequent variables', function() {
        messageFormat.parse('{variable1}{variable2}{variable3}');
        expect(messageFormat.messageAST[0].name).to.equal('variable1');
        expect(messageFormat.messageAST[1].name).to.equal('variable2');
        expect(messageFormat.messageAST[2].name).to.equal('variable3');
        expect(messageFormat.messageAST.length).to.equal(3);
      });

      it('should throw an error if a variable contains non alphanumeric characters', function() {
        var method = function() {
          messageFormat.parse('{!variable1}');
        }
        expect(method).to.throw(TypeError, 'Variable names must be alpha numeric, got a \'!\' in {!');
        var method = function() {
          messageFormat.parse('{varia!ble1}');
        }
        expect(method).to.throw(TypeError, 'Variable names must be alpha numeric, got a \'!\' in {varia!');
        var method = function() {
          messageFormat.parse('{variable1!}');
        }
        expect(method).to.throw(TypeError, 'Variable names must be alpha numeric, got a \'!\' in {variable1!');
        var method = function() {
          messageFormat.parse('{variable1}{varia!ble2}');
        }
        expect(method).to.throw(TypeError, 'Variable names must be alpha numeric, got a \'!\' in {variable1}{varia');
      });
    });

    describe('PluralFormat', function() {
      it('should parse a single case', function() {
        messageFormat.parse('{variable1,plural,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
      });

      it('should parse with multiple cases using keywords', function() {
        messageFormat.parse('{variable1,plural,zero{message1} other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].offset).to.equal(0);
        expect(messageFormat.messageAST[0].values.zero).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,plural,zero{message1}one{message2}other{message3}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].offset).to.equal(0);
        expect(messageFormat.messageAST[0].values.zero).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message2' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message3' }]);
        messageFormat.parse('{variable1,plural,zero{message1}one{message2}two{message3}other{message4}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].offset).to.equal(0);
        expect(messageFormat.messageAST[0].values.zero).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message2' }]);
        expect(messageFormat.messageAST[0].values.two).to.eql([{ string: 'message3' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message4' }]);
        messageFormat.parse('{variable1,plural,zero{message1}one{message2}two{message3}few{message4}other{message5}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].offset).to.equal(0);
        expect(messageFormat.messageAST[0].values.zero).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message2' }]);
        expect(messageFormat.messageAST[0].values.two).to.eql([{ string: 'message3' }]);
        expect(messageFormat.messageAST[0].values.few).to.eql([{ string: 'message4' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message5' }]);
        messageFormat.parse('{variable1,plural,zero{message1}one{message2}two{message3}few{message4}many{message5}other{message6}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].offset).to.equal(0);
        expect(messageFormat.messageAST[0].values.zero).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message2' }]);
        expect(messageFormat.messageAST[0].values.two).to.eql([{ string: 'message3' }]);
        expect(messageFormat.messageAST[0].values.few).to.eql([{ string: 'message4' }]);
        expect(messageFormat.messageAST[0].values.many).to.eql([{ string: 'message5' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message6' }]);
      });

      it('should be able to parse with exact cases', function() {
        messageFormat.parse('{variable1,plural,=1{message1} other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['=1']).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,plural,=1{message1}=2{message2} other{message3}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['=1']).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values['=2']).to.eql([{ string: 'message2' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message3' }]);
      });

      it('should be able to set offset', function() {
        messageFormat.parse('{variable1,plural, offset:1 other{message1}}');
        expect(messageFormat.messageAST[0].offset).to.equal(1);
      });

      it('should be able to parse a sub-message with a sentence', function() {
        messageFormat.parse('{variable1,plural,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0].string).to.eql('message1');
      });

      it('should be able to parse a sub-message with a PluralRemaining', function() {
        messageFormat.parse('{variable1,plural,other{message1#}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0].string).to.eql('message1');
        expect(messageFormat.messageAST[0].values.other[1]).to.be.an.instanceOf(AST.PluralRemaining);
      });

      it('should be able to parse a sub-message with the same variable connected to the PluralFormat', function() {
        messageFormat.parse('{variable1,plural,other{{variable1}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0].name).to.equal('variable1');
      });

      it('should be able to parse a sub-message with a variable that is not connected to the PluralFormat', function() {
        messageFormat.parse('{variable1,plural,other{{variable2}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0].name).to.equal('variable2');
      });

      it('should be able to parse a sub-message with multiple variable that is not connected to the PluralFormat', function() {
        messageFormat.parse('{variable1,plural,other{{variable2}{variable3}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0].name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[1].name).to.equal('variable3');
      });

      it('should be able to parse a sub-message with an another PluralFormat', function() {
        messageFormat.parse('{variable1,plural,other{{variable2,plural,other{message1}}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0]).to.be.an.instanceOf(AST.PluralFormat);
        expect(messageFormat.messageAST[0].values.other[0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[0].values.other[0].string).to.equal('message1');
      });

      it('should be able to parse a sub-message with a SelectFormat', function() {
        messageFormat.parse('{variable1,plural,other{{variable2,select,other{message1}}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0]).to.be.an.instanceOf(AST.SelectFormat);
        expect(messageFormat.messageAST[0].values.other[0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[0].values.other[0].string).to.equal('message1');
      });

      it('should be able to parse a sub-message with a ChoiceFormat', function() {
        messageFormat.parse('{variable1,plural,other{{variable2,choice,1<message1}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0]).to.be.an.instanceOf(AST.ChoiceFormat);
        expect(messageFormat.messageAST[0].values.other[0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[0].values['1<'][0].string).to.equal('message1');
      });

      it('should be able to parse a sub-message with both a SelectFormat and a PluralFormat', function() {
        messageFormat.parse('{variable1,plural,other{{variable2,select,other{message1}}{variable3,plural,other{message2}}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0]).to.be.an.instanceOf(AST.SelectFormat);
        expect(messageFormat.messageAST[0].values.other[0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[0].values.other[0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values.other[1]).to.be.an.instanceOf(AST.PluralFormat);
        expect(messageFormat.messageAST[0].values.other[1].variable.name).to.equal('variable3');
        expect(messageFormat.messageAST[0].values.other[1].values.other[0].string).to.equal('message2');
      });

      it('should be able to parse a sub-message with both a ChoiceFormat and a PluralFormat', function() {
        messageFormat.parse('{variable1,plural,other{{variable2,choice,1<message1}{variable3,plural,other{message2}}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0]).to.be.an.instanceOf(AST.ChoiceFormat);
        expect(messageFormat.messageAST[0].values.other[0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[0].values['1<'][0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values.other[1]).to.be.an.instanceOf(AST.PluralFormat);
        expect(messageFormat.messageAST[0].values.other[1].variable.name).to.equal('variable3');
        expect(messageFormat.messageAST[0].values.other[1].values.other[0].string).to.equal('message2');
      });

      it('should be able to parse a sub-message with both a ChoiceFormat and a SelectFormat', function() {
        messageFormat.parse('{variable1,plural,other{{variable2,choice,1<message1}{variable3,select,other{message2}}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0]).to.be.an.instanceOf(AST.ChoiceFormat);
        expect(messageFormat.messageAST[0].values.other[0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[0].values['1<'][0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values.other[1]).to.be.an.instanceOf(AST.SelectFormat);
        expect(messageFormat.messageAST[0].values.other[1].variable.name).to.equal('variable3');
        expect(messageFormat.messageAST[0].values.other[1].values.other[0].string).to.equal('message2');
      });

      it('should parse with spaces between keywords', function() {
        messageFormat.parse('{variable1,plural,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{ variable1,plural,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1 ,plural,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1, plural,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,plural ,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,plural, other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,plural,other {message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,plural,other {message1} }');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,plural,one{message1}other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,plural, one{message1}other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,plural,one {message1}other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,plural,one{message1} other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,plural,one{message1}other {message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,plural,offset:1 other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].offset).to.equal(1);
        expect(messageFormat.messageAST[0].values.other[0].string).to.equal('message1');
        messageFormat.parse('{variable1,plural, offset:1 other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].offset).to.equal(1);
        expect(messageFormat.messageAST[0].values.other[0].string).to.equal('message1');
        messageFormat.parse('{variable1,plural, offset:1  other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].offset).to.equal(1);
        expect(messageFormat.messageAST[0].values.other[0].string).to.equal('message1');
        messageFormat.parse('{variable1,plural, offset:1 one{message1} other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].offset).to.equal(1);
        expect(messageFormat.messageAST[0].values.one[0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values.other[0].string).to.equal('message2');
      });

      it('should parse with tabs between keywords', function() {
        messageFormat.parse('{variable1,plural,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{\tvariable1,plural,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1\t,plural,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,\tplural,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,plural\t,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,plural,\tother{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,plural,other\t{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,plural,other{message1}\t}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,plural,one{message1}other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,plural,\tone{message1}other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,plural,one\t{message1}other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,plural,one{message1}\tother{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,plural,one{message1}other\t{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.one).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,plural,offset:1 other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].offset).to.equal(1);
        expect(messageFormat.messageAST[0].values.other[0].string).to.equal('message1');
        messageFormat.parse('{variable1,plural,\toffset:1 other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].offset).to.equal(1);
        expect(messageFormat.messageAST[0].values.other[0].string).to.equal('message1');
        messageFormat.parse('{variable1,plural,\toffset:1\tother{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].offset).to.equal(1);
        expect(messageFormat.messageAST[0].values.other[0].string).to.equal('message1');
        messageFormat.parse('{variable1,plural,\toffset:1\tone{message1}\tother{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].offset).to.equal(1);
        expect(messageFormat.messageAST[0].values.one[0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values.other[0].string).to.equal('message2');
      });

      it('should throw an error if there is no other case', function() {
        var method = function() {
          messageFormat.parse('{variable1,plural,one{message1}}');
        }
        expect(method).to.throw(TypeError, 'Missing \'other\' case in {variable1,plural,one{message1}}');
      });

      it('should throw an error if one of the brackets are missing in the values', function() {
        var method = function() {
          messageFormat.parse('{variable1,plural,other message1}}');
        }
        expect(method).to.throw(TypeError, 'Expected bracket \'{\' instead got \'m\' in {variable1,plural,other m');
        var method = function() {
          messageFormat.parse('{variable1,plural,other {message1}');
        }
        expect(method).to.throw(TypeError, 'You must have a closing bracket in your plural format in {variable1,plural,other {message1}');
      });
    });

    describe('SelectFormat', function() {
      it('should be able to parse with a single case', function() {
        messageFormat.parse('{variable1,select,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0].string).to.equal('message1');
      });

      it('should be able to  parse with multiple cases', function() {
        messageFormat.parse('{variable1,select,case1{message1}other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.case1[0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values.other[0].string).to.equal('message2');
        messageFormat.parse('{variable1,select,case1{message1}case2{message2}other{message3}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.case1[0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values.case2[0].string).to.equal('message2');
        expect(messageFormat.messageAST[0].values.other[0].string).to.equal('message3');
      });

      it('should be able to parse with spaces between keywords', function() {
        messageFormat.parse('{variable1,select,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{ variable1,select,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1 ,select,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1, select,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,select ,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,select, other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,select,other {message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,select,other {message1} }');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,select,case1{message1}other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.case1).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,select, case1{message1}other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.case1).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,select,case1 {message1}other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.case1).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,select,case1{message1} other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.case1).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,select,case1{message1}other {message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.case1).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
      });

      it('should be able to parse with tabs between keywords', function() {
        messageFormat.parse('{variable1,select,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{\tvariable1,select,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1\t,select,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,\tselect,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,select\t,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,select,\tother{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,select,other\t{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,select,other{message1}\t}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,select,case1{message1}other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.case1).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,select,\tcase1{message1}other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.case1).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,select,case1\t{message1}other{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.case1).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,select,case1{message1}\tother{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.case1).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
        messageFormat.parse('{variable1,select,case1{message1}other\t{message2}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.case1).to.eql([{ string: 'message1' }]);
        expect(messageFormat.messageAST[0].values.other).to.eql([{ string: 'message2' }]);
      });

      it('should be able to parse a sub-message with a sentence', function() {
        messageFormat.parse('{variable1,select,other{message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0].string).to.eql('message1');
      });

      it('should be able to parse a sub-message with the same variable connected to the SelectFormat', function() {
        messageFormat.parse('{variable1,select,other{{variable1}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0].name).to.equal('variable1');
      });

      it('should be able to parse a sub-message with a variable that is not connected to the SelectFormat', function() {
        messageFormat.parse('{variable1,select,other{{variable2}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0].name).to.equal('variable2');
      });

      it('should be able to parse a sub-message with multiple variable that is not connected to the SelectFormat', function() {
        messageFormat.parse('{variable1,select,other{{variable2}{variable3}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0].name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[1].name).to.equal('variable3');
      });

      it('should be able to parse a sub-message with an another SelectFormat', function() {
        messageFormat.parse('{variable1,select,other{{variable2,select,other{message1}}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0]).to.be.an.instanceOf(AST.SelectFormat);
        expect(messageFormat.messageAST[0].values.other[0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[0].values.other[0].string).to.equal('message1');
      });

      it('should be able to parse a sub-message with a PluralFormat', function() {
        messageFormat.parse('{variable1,select,other{{variable2,plural,other{message1}}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0]).to.be.an.instanceOf(AST.PluralFormat);
        expect(messageFormat.messageAST[0].values.other[0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[0].values.other[0].string).to.equal('message1');
      });

      it('should be able to parse a sub-message with a ChoiceFormat', function() {
        messageFormat.parse('{variable1,select,other{{variable2,choice,1<message1}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0]).to.be.an.instanceOf(AST.ChoiceFormat);
        expect(messageFormat.messageAST[0].values.other[0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[0].values['1<'][0].string).to.equal('message1');
      });

      it('should be able to parse a sub-message with both a SelectFormat and a PluralFormat', function() {
        messageFormat.parse('{variable1,select,other{{variable2,select,other{message1}}{variable3,plural,other{message2}}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0]).to.be.an.instanceOf(AST.SelectFormat);
        expect(messageFormat.messageAST[0].values.other[0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[0].values.other[0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values.other[1]).to.be.an.instanceOf(AST.PluralFormat);
        expect(messageFormat.messageAST[0].values.other[1].variable.name).to.equal('variable3');
        expect(messageFormat.messageAST[0].values.other[1].values.other[0].string).to.equal('message2');
      });

      it('should be able to parse a sub-message with both a PluralFormat and a ChoiceFormat', function() {
        messageFormat.parse('{variable1,select,other{{variable2,plural,other{message1}}{variable3,choice,1<message2}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0]).to.be.an.instanceOf(AST.PluralFormat);
        expect(messageFormat.messageAST[0].values.other[0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[0].values.other[0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values.other[1]).to.be.an.instanceOf(AST.ChoiceFormat);
        expect(messageFormat.messageAST[0].values.other[1].variable.name).to.equal('variable3');
        expect(messageFormat.messageAST[0].values.other[1].values['1<'][0].string).to.equal('message2');
      });

      it('should be able to parse a sub-message with both a SelectFormat and a ChoiceFormat', function() {
        messageFormat.parse('{variable1,select,other{{variable2,select,other{message1}}{variable3,choice,1<message2}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values.other[0]).to.be.an.instanceOf(AST.SelectFormat);
        expect(messageFormat.messageAST[0].values.other[0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values.other[0].values.other[0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values.other[1]).to.be.an.instanceOf(AST.ChoiceFormat);
        expect(messageFormat.messageAST[0].values.other[1].variable.name).to.equal('variable3');
        expect(messageFormat.messageAST[0].values.other[1].values['1<'][0].string).to.equal('message2');
      });

      it('should throw an error if there is no other case', function() {
        var method = function() {
          messageFormat.parse('{variable1,select,case1{message1}}');
        }
        expect(method).to.throw(TypeError, 'Missing \'other\' case in {variable1,select,case1{message1}}');
      });

      it('should throw an error if one of the brackets are missing in the values', function() {
        var method = function() {
          messageFormat.parse('{variable1,select,other message1}}');
        }
        expect(method).to.throw(TypeError, 'Expected bracket \'{\' instead got \'m\' in {variable1,select,other m');
        var method = function() {
          messageFormat.parse('{variable1,select,other {message1}');
        }
        expect(method).to.throw(TypeError, 'You must have a closing bracket in your select format in {variable1,select,other {message1}');
      });
    });

    describe('ChoiceFormat', function() {
      it('should be able to parse a single case', function() {
        messageFormat.parse('{variable1,choice,1<message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<'][0].string).to.equal('message1');
      });

      it('should be able to parse a case with positive infinity', function() {
        messageFormat.parse('{variable1,choice,∞#message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['∞#'][0].string).to.equal('message1');
      });

      it('should be able to parse a case with negative infinity', function() {
        messageFormat.parse('{variable1,choice,-∞#message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['-∞#'][0].string).to.equal('message1');
      });

      it('should be able to parse a case with a negative double', function() {
        messageFormat.parse('{variable1,choice,-1#message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['-1#'][0].string).to.equal('message1');
        messageFormat.parse('{variable1,choice,-2#message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['-2#'][0].string).to.equal('message1');
      });

      it('should be able to parse multiple cases', function() {
        messageFormat.parse('{variable1,choice,1<message1|3#message2}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<'][0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values['3#'][0].string).to.equal('message2');
        messageFormat.parse('{variable1,choice,1<message1|3#message2|4#message3}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<'][0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values['3#'][0].string).to.equal('message2');
        expect(messageFormat.messageAST[0].values['4#'][0].string).to.equal('message3');
      });

      it('should be able to parse sub-messages with ChoiceFormat', function() {
        messageFormat.parse('{variable1,choice,1<{variable2,choice,1<message1}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<'][0]).to.be.an.instanceOf(AST.ChoiceFormat);
        expect(messageFormat.messageAST[0].values['1<'][0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values['1<'][0].values['1<'][0].string).to.equal('message1');
      });

      it('should be able to parse sub-messages with SelectFormat', function() {
        messageFormat.parse('{variable1,choice,1<{variable2,select,case1{message1}other{message2}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<'][0]).to.be.an.instanceOf(AST.SelectFormat);
        expect(messageFormat.messageAST[0].values['1<'][0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values['1<'][0].values['case1'][0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values['1<'][0].values['other'][0].string).to.equal('message2');
      });

      it('should be able to parse sub-messages with PluralFormat', function() {
        messageFormat.parse('{variable1,choice,1<{variable2,plural,one{message1}other{message2}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<'][0]).to.be.an.instanceOf(AST.PluralFormat);
        expect(messageFormat.messageAST[0].values['1<'][0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values['1<'][0].values['one'][0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values['1<'][0].values['other'][0].string).to.equal('message2');
      });

      it('should be able to parse a single sub-messages with both ChoiceFormat and PluralFormat', function() {
        messageFormat.parse('{variable1,choice,1<{variable2,choice,1<message1}{variable3,plural,one{message2}other{message3}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<'][0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values['1<'][0]).to.be.an.instanceOf(AST.ChoiceFormat);
        expect(messageFormat.messageAST[0].values['1<'][0].values['1<'][0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values['1<'][1]).to.be.an.instanceOf(AST.PluralFormat);
        expect(messageFormat.messageAST[0].values['1<'][1].variable.name).to.equal('variable3');
        expect(messageFormat.messageAST[0].values['1<'][1].values['one'][0].string).to.equal('message2');
        expect(messageFormat.messageAST[0].values['1<'][1].values['other'][0].string).to.equal('message3');
      });

      it('should be able to parse a single sub-messages with both SelectFormat and PluralFormat', function() {
        messageFormat.parse('{variable1,choice,1<{variable2,select,case1{message1}other{message2}}{variable3,plural,one{message3}other{message4}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<'][0]).to.be.an.instanceOf(AST.SelectFormat);
        expect(messageFormat.messageAST[0].values['1<'][0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values['1<'][0].values['case1'][0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values['1<'][0].values['other'][0].string).to.equal('message2');
        expect(messageFormat.messageAST[0].values['1<'][1]).to.be.an.instanceOf(AST.PluralFormat);
        expect(messageFormat.messageAST[0].values['1<'][1].variable.name).to.equal('variable3');
        expect(messageFormat.messageAST[0].values['1<'][1].values['one'][0].string).to.equal('message3');
        expect(messageFormat.messageAST[0].values['1<'][1].values['other'][0].string).to.equal('message4');
      });

      it('should be able to parse a single sub-messages with both SelectFormat and ChoiceFormat', function() {
        messageFormat.parse('{variable1,choice,1<{variable2,select,one{message1}other{message2}}{variable3,choice,1<message3}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<'][0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values['1<'][0]).to.be.an.instanceOf(AST.SelectFormat);
        expect(messageFormat.messageAST[0].values['1<'][0].values['one'][0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values['1<'][0].values['other'][0].string).to.equal('message2');
        expect(messageFormat.messageAST[0].values['1<'][1]).to.be.an.instanceOf(AST.ChoiceFormat);
        expect(messageFormat.messageAST[0].values['1<'][1].variable.name).to.equal('variable3');
        expect(messageFormat.messageAST[0].values['1<'][1].values['1<'][0].string).to.equal('message3');
      });

      it('should be able to parse multiple sub-messages with both SelectFormat and PluralFormat', function() {
        messageFormat.parse('{variable1,choice,1<{variable2,plural,one{message1}other{message2}}{variable3,select,case1{message3}other{message4}}|2#{variable2,plural,one{message1}other{message2}}{variable3,select,case1{message3}other{message4}}}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<'][0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values['1<'][0].values['one'][0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values['1<'][0].values['other'][0].string).to.equal('message2');
        expect(messageFormat.messageAST[0].values['1<'][1].variable.name).to.equal('variable3');
        expect(messageFormat.messageAST[0].values['1<'][1].values['case1'][0].string).to.equal('message3');
        expect(messageFormat.messageAST[0].values['1<'][1].values['other'][0].string).to.equal('message4');
        expect(messageFormat.messageAST[0].values['2#'][0].variable.name).to.equal('variable2');
        expect(messageFormat.messageAST[0].values['2#'][0].values['one'][0].string).to.equal('message1');
        expect(messageFormat.messageAST[0].values['2#'][0].values['other'][0].string).to.equal('message2');
        expect(messageFormat.messageAST[0].values['2#'][1].variable.name).to.equal('variable3');
        expect(messageFormat.messageAST[0].values['2#'][1].values['case1'][0].string).to.equal('message3');
        expect(messageFormat.messageAST[0].values['2#'][1].values['other'][0].string).to.equal('message4');
      });

      it('should be able to parse with spaces between keywords', function() {
        messageFormat.parse('{ variable1,choice,1<message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<']).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1 ,choice,1<message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<']).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1, choice,1<message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<']).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,choice ,1<message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<']).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,choice, 1<message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<']).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,choice, 1< message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<']).to.eql([{ string: ' message1' }]);
      });

      it('should be able to parse with tabs between keywords', function() {
        messageFormat.parse('{\tvariable1,choice,1<message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<']).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1\t,choice,1<message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<']).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,\tchoice,1<message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<']).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,choice\t,1<message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<']).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,choice,\t1<message1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<']).to.eql([{ string: 'message1' }]);
        messageFormat.parse('{variable1,choice, 1<\tmessage1}');
        expect(messageFormat.messageAST[0].variable.name).to.equal('variable1');
        expect(messageFormat.messageAST[0].values['1<']).to.eql([{ string: '\tmessage1' }]);
      });

      it('should throw en error if \'<\' or \'#\' is missing', function() {
        var method = function() {
          messageFormat.parse('{variable1,choice,1message1}');
        };
        expect(method).to.throw(TypeError, 'Expected a ChoiceFormat case (/^(\\-?\\d+\\.?\\d*[<#]|∞#|\\-∞[<#])$/), instead got \'1\' in {variable1,choice,1m');
      });

      it('should throw en error if the cases are not in order', function() {
        var method = function() {
          messageFormat.parse('{variable1,choice,2<message1|1<message2}');
        };
        expect(method).to.throw(TypeError, 'Case \'1<\' needs to bigger than case \'2<\' in {variable1,choice,2<message1|1<m');
        var method = function() {
          messageFormat.parse('{variable1,choice,1#message1|1<message2}');
        };
        expect(method).to.throw(TypeError, 'Case \'1<\' needs to bigger than case \'1#\' in {variable1,choice,1#message1|1<m');
        var method = function() {
          messageFormat.parse('{variable1,choice,1#message1|-1<message2}');
        };
        expect(method).to.throw(TypeError, 'Case \'-1<\' needs to bigger than case \'1#\' in {variable1,choice,1#message1|-1<m');
        var method = function() {
          messageFormat.parse('{variable1,choice,1#message1|-∞#message2}');
        };
        expect(method).to.throw(TypeError, 'Case \'-∞#\' needs to bigger than case \'1#\' in {variable1,choice,1#message1|-∞#m');
      });

      it('should throw an error if ∞< is used', function() {
         var method = function() {
          messageFormat.parse('{variable1,choice,1#message1|∞<message2}');
        };
        expect(method).to.throw(TypeError, 'Expected a ChoiceFormat case (/^(\\-?\\d+\\.?\\d*[<#]|∞#|\\-∞[<#])$/), instead got \'∞<\' in {variable1,choice,1#message1|∞<m');
      });

      it('should throw an error if same cases appears', function() {
        var method = function() {
          messageFormat.parse('{variable1,choice,1<message1|1<message2}');
        };
        expect(method).to.throw(TypeError, 'Same ChoiceFormat case in {variable1,choice,1<message1|1<m');
      });
    });
  });
});
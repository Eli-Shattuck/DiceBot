function styleFont(str, firstUppercase, firstLowercase, firstNumber, specialCases, specialCaseOutputs){
    let result = '';
    let i;
    for(let char of str){
        if(specialCases) i = specialCases.indexOf(char);
        if(i >= 0){
            result += specialCaseOutputs[i];
        } else if(firstUppercase && char.match(/[A-Z]/)) {
            result += String.fromCharCode(
                firstUppercase.charCodeAt(0),
                firstUppercase.charCodeAt(1) + char.charCodeAt(0) - 'A'.charCodeAt(0)
            );
        } else if(firstLowercase && char.match(/[a-z]/)) {
            result += String.fromCharCode(
                firstLowercase.charCodeAt(0),
                firstLowercase.charCodeAt(1) + char.charCodeAt(0) - 'a'.charCodeAt(0)
            );
        } else if(firstNumber && char.match(/[0-9]/)) {
            result += String.fromCharCode(
                firstNumber.charCodeAt(0),
                firstNumber.charCodeAt(1) + char.charCodeAt(0) - '0'.charCodeAt(0)
            );
        } else {
            result += char;
        }
    }
    return result;
}

//this is an object storing lambdas that each style a string in some way
const styles = {
    'serif normal' : (str) => { return str; },

    'serif bold' : (str) => {
        return styleFont(str,'𝐀','𝐚','𝟎');
    },

    'serif italic' : (str) => {
        return styleFont(str, '𝐴', '𝑎', null,
            ['h'],
            ['ℎ']
        );
    },

    'serif bold italic' : (str) => {
        return styleFont(str, '𝑨', '𝒂');
    },

    'sans-serif normal' : (str) => {
        return styleFont(str, '𝖠', '𝖺', '𝟢');
    },

    'sans-serif bold' : (str) => {
        return styleFont(str, '𝗔', '𝗮', '𝟬');
    },

    'sans-serif italic' : (str) => {
        return styleFont(str, '𝘈', '𝘢');
    },

    'sans-serif bold italic' : (str) => {
        return styleFont(str, '𝘼', '𝙖');
    },

    'cal normal' : (str) =>  {
        return styleFont(str, '𝒜', '𝒶', null,
            ['B','E','F','H','I','L','M','R','e','g','o'],
            ['ℬ','ℰ','ℱ','ℋ','ℐ','ℒ','ℳ','ℛ','ℯ','ℊ','ℴ']
        );
    },

    'cal bold' : (str) => {
        return styleFont(str, '𝓐', '𝓪');
    },

    'fraktur normal' : (str) => {
        return styleFont(str, '𝔄', '𝔞', null,
            ['C','H','I','R','Z'],
            ['ℭ','ℌ','ℑ','ℜ','ℨ']
        );
    },

    'fractur bold' : (str) => {
        return styleFont(str, '𝕬', '𝖆');
    },

    'mono' : (str) => {
        return styleFont(str, '𝙰', '𝚊', '𝟶');
    },

    'bb' : (str) => {
        return styleFont(str, '𝔸', '𝕒', '𝟘',
            ['C','H','N','P','Q','R','Z'],
            ['ℂ','ℍ','ℕ','ℙ','ℚ','ℝ','ℤ']
        );
    }
}

module.exports = (styleString) => {
    if(styles[styleString.style]){
        return styles[styleString.style](styleString.str);
    } else {
        console.log(`The style ${styleString.style} is not available.`);
        return null;
    }
}
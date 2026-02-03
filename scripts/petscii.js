class Petscii {
    static table = { 
        2: '\uE082', 3: '\uE083', 4: '\uE084', 5: '\uE085', 7: '\uE087',
        8: '\uE088', 9: '\uE089', 10: '\uE08A', 11: '\uE08B',
        12: '\uE08C', 13: '\uE08D', 14: '\uE08E', 15: '\uE08F',
        17: '\uE091', 18: '\uE092', 19: '\uE093', 20: '\uE094',
        24: '\uE098', 27: '\uE09B', 28: '\uE09C', 29: '\uE09D',
        30: '\uE09E', 31: '\uE09F',
        32: ' ', 33: '!', 34: '"', 35: '#', 36: '$', 37: '%', 38: '&', 39: "'", 
        40: '(', 41: ')', 42: '*', 43: '+', 44: ',', 45: '-', 46: '.', 47: '/', 
        48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 
        56: '8', 57: '9', 58: ':', 59: ';', 60: '<', 61: '=', 62: '>', 63: '?', 
        64: '@', 65: 'A', 66: 'B', 67: 'C', 68: 'D', 69: 'E', 70: 'F', 71: 'G',
        72: 'H', 73: 'I', 74: 'J', 75: 'K', 76: 'L', 77: 'M', 78: 'N', 79: 'O', 
        80: 'P', 81: 'Q', 82: 'R', 83: 'S', 84: 'T', 85: 'U', 86: 'V', 87: 'W', 
        88: 'X', 89: 'Y', 90: 'Z', 91: '[', 92: '£', 93: ']', 94: '\uE01E', 95: '\uE01F',
        96: '\uE040', 97: '\uE041', 98: '\uE042', 99: '\uE043',
        100: '\uE044', 101: '\uE045', 102: '\uE046', 103: '\uE047',
        104: '\uE048', 105: '\uE049', 106: '\uE04A', 107: '\uE04B',
        108: '\uE04C', 109: '\uE04D', 110: '\uE04E', 111: '\uE04F',
        112: '\uE050', 113: '\uE051', 114: '\uE052', 115: '\uE053',
        116: '\uE054', 117: '\uE055', 118: '\uE056', 119: '\uE057',
        120: '\uE058', 121: '\uE059', 122: '\uE05A', 123: '\uE05B',
        124: '\uE05C', 125: '\uE05D', 126: '\uE05E', 127: '\uE05F',
        129: '\uE0C1', 130: '\uE0C2', 131: '\uE0C3', 133: '\uE0C5',
        134: '\uE0C6', 135: '\uE0C7', 136: '\uE0C8', 137: '\uE0C9',
        138: '\uE0CA', 139: '\uE0CB', 140: '\uE0CC', 141: '\uE0CD',
        142: '\uE0CE', 143: '\uE0CF', 144: '\uE0D0', 145: '\uE0D1',
        146: '\uE0D2', 147: '\uE0D3', 148: '\uE0D4', 149: '\uE0D5',
        150: '\uE0D6', 151: '\uE0D7', 152: '\uE0D8', 153: '\uE0D9',
        154: '\uE0DA', 155: '\uE0DB', 156: '\uE0DC', 157: '\uE0DD',
        158: '\uE0DE', 159: '\uE0DF',
        160: '\uE060', 161: '\uE061', 162: '\uE062', 163: '\uE063',
        164: '\uE064', 165: '\uE065', 166: '\uE066', 167: '\uE067',
        168: '\uE068', 169: '\uE069', 170: '\uE06A', 171: '\uE06B',
        172: '\uE06C', 173: '\uE06D', 174: '\uE06E', 175: '\uE06F',
        176: '\uE070', 177: '\uE071', 178: '\uE072', 179: '\uE073',
        180: '\uE074', 181: '\uE075', 182: '\uE076', 183: '\uE077',
        184: '\uE078', 185: '\uE079', 186: '\uE07A', 187: '\uE07B',
        188: '\uE07C', 189: '\uE07D', 190: '\uE07E', 191: '\uE07F',
        192: '\uE040', 193: '\uE041', 194: '\uE042', 195: '\uE043',
        196: '\uE044', 197: '\uE045', 198: '\uE046', 199: '\uE047',
        200: '\uE048', 201: '\uE049', 202: '\uE04A', 203: '\uE04B',
        204: '\uE04C', 205: '\uE04D', 206: '\uE04E', 207: '\uE04F',
        208: '\uE050', 209: '\uE051', 210: '\uE052', 211: '\uE053',
        212: '\uE054', 213: '\uE055', 214: '\uE056', 215: '\uE057',
        216: '\uE058', 217: '\uE059', 218: '\uE05A', 219: '\uE05B',
        220: '\uE05C', 221: '\uE05D', 222: '\uE05E', 223: '\uE05F',
        224: '\uE060', 225: '\uE061', 226: '\uE062', 227: '\uE063',
        228: '\uE064', 229: '\uE065', 230: '\uE066', 231: '\uE067',
        232: '\uE068', 233: '\uE069', 234: '\uE06A', 235: '\uE06B',
        236: '\uE06C', 237: '\uE06D', 238: '\uE06E', 239: '\uE06F',
        240: '\uE070', 241: '\uE071', 242: '\uE072', 243: '\uE073',
        244: '\uE074', 245: '\uE075', 246: '\uE076', 247: '\uE077',
        248: '\uE078', 249: '\uE079', 250: '\uE07A', 251: '\uE07B',
        252: '\uE07C', 253: '\uE07D', 254: '\uE07E', 255: '\uE07F',
    }
    static {
        this.lookup = {}
        for (const code in this.table) {
            const char = this.table[code]
            if (char in this.lookup) { continue }
            this.lookup[char] = code
        }

        this.machineNamed = {
            'vic20': {
                'stop': this.table[3],
                'white': this.table[5],
                'lock-case': this.table[8],
                'unlock-case': this.table[9],
                'return': this.table[13],
                'lower-case': this.table[14],
                'down': this.table[17],
                'reverse-on': this.table[18],
                'home': this.table[19],
                'delete': this.table[20],
                'red': this.table[28],
                'right': this.table[29],
                'green': this.table[30],
                'blue': this.table[31],
                'up-arrow': this.table[94],
                'left-arrow': this.table[95],
                'shift-*': this.table[96],
                'shift-+': this.table[123],
                'cbm--': this.table[124],
                'shift--': this.table[125],
                'pi': this.table[126],
                'cbm-*': this.table[127],
                'run': this.table[131],
                'f1': this.table[133],
                'f3': this.table[134],
                'f5': this.table[135],
                'f7': this.table[136],
                'f2': this.table[137],
                'f4': this.table[138],
                'f6': this.table[139],
                'f8': this.table[140],
                'shift-return': this.table[141],
                'upper-case': this.table[142],
                'black': this.table[144],
                'up': this.table[145],
                'reverse-off': this.table[146],
                'clear': this.table[147],
                'insert': this.table[148],
                'purple': this.table[156],
                'left': this.table[157],
                'yellow': this.table[158],
                'cyan': this.table[159],
                'shift-+': this.table[166],
                'shift-£': this.table[169],
                'shift-@': this.table[186],               
            }
        }
        let code = 32
        for (const letter of ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[£]`) {
            this.machineNamed['vic20'][letter] = this.table[code++]
        }
        code = 97
        for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
            this.machineNamed['vic20'][`shift-${letter}`] = this.table[code++]
        }
        code = 161
        for (const letter of 'KIT@G+M£xNQDZSPAERWHJLYUOxFCXVB') {
            if (letter === 'x') { continue }
            this.machineNamed['vic20'][`cbm-${letter}`] = this.table[code++]
        }
        this.machineNamed['c64'] = {
            ...this.machineNamed['vic20'],
            'orange': this.table[129],
            'brown': this.table[149],
            'lt-red': this.table[150],
            'dk-gray': this.table[151],
            'med-gray': this.table[152],
            'lt-green': this.table[153],
            'lt-blue': this.table[154],
            'lt-gray': this.table[155],
        }

        this.machineNamed['c128'] = { 
            ...this.machineNamed['c64'],
            'underline-on': this.table[2],
            'bell': this.table[7],
            'tab': this.table[9],
            'linefeed': this.table[10],
            'lock-case': this.table[11],
            'unlock-case': this.table[12],
            'flash-on': this.table[15],
            'toggle-tab': this.table[24],
            'esc': this.table[27],
            'dk-purple': this.table[0x81],
            'underline-off': this.table[0x82],
            'flash-off': this.table[0x8f],
            'dk-yellow': this.table[0x95],
            'dk-cyan': this.table[0x97],
        }

        this.machineNamed['ted'] = {
            ...this.machineNamed['c64'],
            'flash-on': this.table[0x82],
            'flash-off': this.table[0x84],
            'yellow-green': this.table[0x96],
            'pink': this.table[0x97],
            'blue-green': this.table[0x98],
            'lt-blue': this.table[0x99],
            'dk-blue': this.table[0x9a],
            'lt-green': this.table[0x9b],
            'lt-red': null,
            'dk-gray': null,
            'med-gray': null,
            'lt-gray': null,
        }

        this.named = this.machineNamed['c128'] // for now
    }
}

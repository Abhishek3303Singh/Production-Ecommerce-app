class TrieNode{
    constructor(){
        this.children={},
        this.isEnd= false,
        this.words=[]
    }
}

class Trie{
    constructor(){
        this.root = new TrieNode()
    }

    insert(word){
        let node = this.root
        for(let chr of word.toLowerCase()){
            if(!node.children[chr]){
                node.children[chr] = new TrieNode()
            }
            node = node.children[chr]
            if(node.words.length <5){
                node.words.push(word)
            }

        }
        node.isEnd = true;
    }

    search(prefix){
        let node = this.root
        for(let chr of prefix.toLowerCase()){
            if(!node.children[chr]){
                return []
            }
            node = node.children[chr]
        }
        return node.words
    }
}

module.exports = Trie
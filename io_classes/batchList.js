module.exports = class BatchList {
	constructor() {
		this.batches = [''];
		this.currentBatch = 0;
	}
	
	push(newData) {
		if(this.batches[this.currentBatch].length + newData.length < BATCH_SIZE-1) {
			this.batches[this.currentBatch] += newData;
			return;
		}
		if(newData.length >= BATCH_SIZE-1) {
			let i = 0;
			while(i < newData.length) {
				this.batches[++this.currentBatch] = newData.subString(i, i+BATCH_SIZE);
				i+=BATCH_SIZE;
			}
			this.batches[++this.currentBatch] = newData.subString(i);
			return;
		}
		
		this.batches[++this.currentBatch] = newData;
		return;
	}
}
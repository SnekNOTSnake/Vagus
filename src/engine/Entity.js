export default class Entity {
	constructor() {
		this.id = Math.floor(Math.random() * 2 ** 16)
		this.level = 0
	}
}

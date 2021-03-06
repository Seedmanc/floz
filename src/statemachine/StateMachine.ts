import S from '~/const/StateKeys';

export interface IState
{
	name: string|number
	onEnter?: () => void
	onUpdate?: (dt?: number) => void
	onExit?: () => void
	final?: boolean;
}

// todo extract more code into states

let idCount = 0

export default class StateMachine
{
	private id = (++idCount).toString()
	private context?: object
	private states = new Map<string|number, IState>()

	private previousState?: IState
	private currentState!: IState
	private isChangingState = false
	private changeStateQueue: (string|number)[] = []

	get previousStateName()
	{
		return this.previousState?.name
	}

	constructor(context?: object, id?: string)
	{
		this.id = id ?? this.id
		this.context = context
	}

	isCurrentState(name: string|number)
	{
		if (!this.currentState)
		{
			return false
		}

		return this.currentState.name == name
	}

	addState(name: string|number, config?: Omit<IState, 'name'>)
	{
		const context = this.context
		
		this.states.set(name, {
			name,
			onEnter: config?.onEnter?.bind(context),
			onUpdate: config?.onUpdate?.bind(context),
			onExit: config?.onExit?.bind(context),
			final: config?.final
		})

		return this
	}

	setState(name: string|number)
	{
		if (!this.states.has(name))
		{
			console.warn(`Tried to change to unknown state: ${S[name]}`)
			return
		}

		if (this.isCurrentState(name))
		{
			return
		}

		if (this.currentState?.final)
			return;

		if (this.isChangingState)
		{
			this.changeStateQueue.push(name)
			return
		}

		this.isChangingState = true

		console.log(`[StateMachine (${this.id})] change from ${S[this.currentState?.name ?? 'none']} to ${S[name]}`)

		if (this.currentState && this.currentState.onExit)
		{
			this.currentState.onExit()
		}

		this.previousState = this.currentState
		this.currentState = this.states.get(name)!

		if (this.currentState.onEnter)
		{
			this.currentState.onEnter()
		}

		this.isChangingState = false
	}

	update(dt?: number)
	{
		if (this.changeStateQueue.length > 0)
		{
			this.setState(this.changeStateQueue.shift()!)
			return
		}

		if (this.currentState && this.currentState.onUpdate)
		{
			this.currentState.onUpdate(dt)
		}
	}
}

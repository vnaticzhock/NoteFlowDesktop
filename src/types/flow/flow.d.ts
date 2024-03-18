// use type rather than interface
// type can allow singe or union types
// interface can only allow object
// For example:
// type Color = 'red' | 'blue' | 'green' // OK
// interface Color = 'red' | 'blue' | 'green' // Error
// type Color = { red: string, blue: string, green: string } // OK

type IFlow = {
  type: 'flow'
  id: string
  title: string
  thumbnail: string
}

export type { iFlow }

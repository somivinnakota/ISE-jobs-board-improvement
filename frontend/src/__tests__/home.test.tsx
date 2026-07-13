import Home from '@/app/(main)/page'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

describe('Home', () => {
	it('renders a heading', () => {
		render(<Home />)

		const heading = screen.getByRole("heading", { level: 1 })

		expect(heading).toBeInTheDocument()
	})
})

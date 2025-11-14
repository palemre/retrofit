'use client';

import { useMemo } from 'react';

interface DataRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
}

interface DataRoomDocument {
  name: string;
  type: string;
  size: string;
  updated: string;
}

interface DataRoomCategory {
  name: string;
  description: string;
  documents: DataRoomDocument[];
}

const DATAROOM_CATEGORIES: DataRoomCategory[] = [
  {
    name: 'Genesis',
    description: 'Foundational ownership, permitting, planning, and insurance documentation.',
    documents: [
      {
        name: 'Ownership-Deed.pdf',
        type: 'Ownership Certificate',
        size: '1.8 MB',
        updated: 'Jan 12, 2024'
      },
      {
        name: 'Retrofit-Permit-Set.pdf',
        type: 'Permitting Package',
        size: '4.2 MB',
        updated: 'Feb 08, 2024'
      },
      {
        name: 'Insurance-Coverage-Binder.pdf',
        type: 'Insurance Binder',
        size: '2.5 MB',
        updated: 'Mar 19, 2024'
      }
    ]
  },
  {
    name: 'Structure',
    description: 'Structural assessments and reinforcement plans for the core building elements.',
    documents: [
      {
        name: 'Structural-Assessment-Report.pdf',
        type: 'Assessment Report',
        size: '3.4 MB',
        updated: 'Apr 02, 2024'
      },
      {
        name: 'Steel-Framing-Diagrams.pdf',
        type: 'Framing Diagrams',
        size: '5.1 MB',
        updated: 'Apr 16, 2024'
      },
      {
        name: 'Seismic-Retrofit-Calculations.pdf',
        type: 'Engineering Calculations',
        size: '2.9 MB',
        updated: 'May 01, 2024'
      }
    ]
  },
  {
    name: 'Architecture',
    description: 'Detailed layouts for envelope upgrades including doors, windows, floors, and ceilings.',
    documents: [
      {
        name: 'Window-Glazing-Schedule.pdf',
        type: 'Glazing Specification',
        size: '2.1 MB',
        updated: 'Feb 27, 2024'
      },
      {
        name: 'Door-Hardware-Plan.pdf',
        type: 'Hardware Schedule',
        size: '1.6 MB',
        updated: 'Mar 04, 2024'
      },
      {
        name: 'Ceiling-Finish-Layout.pdf',
        type: 'Finish Layout',
        size: '3.0 MB',
        updated: 'Mar 22, 2024'
      }
    ]
  },
  {
    name: 'Wired',
    description: 'Systems documentation for building services including HVAC, lift, and smart controls.',
    documents: [
      {
        name: 'HVAC-Equipment-Schedule.pdf',
        type: 'Mechanical Schedule',
        size: '3.8 MB',
        updated: 'Jan 30, 2024'
      },
      {
        name: 'Elevator-Modernization-Plan.pdf',
        type: 'Lift Modernization',
        size: '4.6 MB',
        updated: 'Feb 18, 2024'
      },
      {
        name: 'Smart-Building-Wiring-Map.pdf',
        type: 'Wiring Diagram',
        size: '2.2 MB',
        updated: 'Mar 28, 2024'
      }
    ]
  },
  {
    name: 'Filled',
    description: 'Interior design packages capturing furnishings, finishes, and placemaking upgrades.',
    documents: [
      {
        name: 'Interior-Finish-Boards.pdf',
        type: 'Finish Boards',
        size: '2.7 MB',
        updated: 'Apr 11, 2024'
      },
      {
        name: 'Furniture-Fixture-Inventory.pdf',
        type: 'FF&E Inventory',
        size: '3.9 MB',
        updated: 'Apr 23, 2024'
      },
      {
        name: 'Lighting-Scene-Designs.pdf',
        type: 'Lighting Layout',
        size: '1.9 MB',
        updated: 'May 08, 2024'
      }
    ]
  }
];

export default function DataRoomModal({ isOpen, onClose, projectName }: DataRoomModalProps) {
  const documentCount = useMemo(
    () => DATAROOM_CATEGORIES.reduce((acc, category) => acc + category.documents.length, 0),
    []
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{projectName} Data Room</h2>
            <p className="mt-1 text-sm text-gray-600">
              {documentCount} curated documents organized across five diligence categories.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-semibold text-gray-400 transition hover:text-gray-600"
            aria-label="Close data room"
          >
            ×
          </button>
        </div>

        <div className="h-[70vh] overflow-y-auto px-6 py-6">
          <div className="grid gap-6">
            {DATAROOM_CATEGORIES.map((category) => (
              <section key={category.name} className="rounded-xl border border-gray-200 bg-gray-50">
                <header className="border-b border-gray-200 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm">
                      {category.documents.length} files
                    </span>
                  </div>
                </header>
                <ul className="divide-y divide-gray-200 bg-white">
                  {category.documents.map((document) => (
                    <li key={`${category.name}-${document.name}`} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{document.name}</p>
                        <p className="text-sm text-gray-500">{document.type}</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>{document.updated}</span>
                        <span>{document.size}</span>
                        <a
                          href="#"
                          className="rounded-lg border border-green-600 px-3 py-1.5 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                        >
                          Preview
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

